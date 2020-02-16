module.exports = (window) => {
  const haveEvents = 'ongamepadconnected' in window;
  const gamepadStates = {};

  const connecthandler = (e) => {
    addGamepad(e.gamepad);
  };

  const disconnecthandler = (e) => {
    removeGamepad(e.gamepad);
  };

  const addGamepad = (gamepad) => {
    gamepadStates[gamepad.index] = {
      gamepad
    };
    window.requestAnimationFrame(updateStatus);
  };

  const removeGamepad = (gamepad) => {
    delete gamepadStates[gamepad.index];
  };

  const getGamePadState = (gamepad) => {
    return {
      buttons: [
        ...gamepad.buttons.map(button => {
          let pressed;
          if (typeof button === 'object') {
            pressed = button.pressed ? 1.0 : 0.0;
          } else {
            pressed = button;
          }
          return pressed;
        })
      ],
      axes: [
        ...gamepad.axes
      ]
    };
  };

  const updateStatus = () => {
    if (!haveEvents) {
      scanGamepads();
    }

    for (let i in gamepadStates) {
      if (Object.prototype.hasOwnProperty.call(gamepadStates, i)) {
        const gamepadState = gamepadStates[i];
        const newState = getGamePadState(gamepadState.gamepad);
        fireStateChanges({i, oldState: gamepadState.state, newState});
        gamepadState.state = newState;
      }
    }

    window.requestAnimationFrame(updateStatus);
  };

  const fireStateChanges = ({i, oldState, newState}) => {
    if (oldState && newState) {
      const buttonChangeIndices = [];
      const axisChangeIndices = [];

      newState.buttons.forEach((button, index) => {
        if (oldState.buttons[index] !== button) {
          buttonChangeIndices.push(index);
        }
      });

      newState.axes.forEach((axis, index) => {
        if (oldState.axes[index] !== axis) {
          axisChangeIndices.push(index);
        }
      });

      buttonChangeIndices.forEach(index => {
        window.dispatchEvent(new CustomEvent(
          'gamepadButton',
          {
            detail: {
              controller: i,
              button: index,
              state: newState.buttons[index]
            }
          }
        ));
        //console.log(JSON.stringify({controller: i, button: index, state: newState.buttons[index]}));
      });

      axisChangeIndices.forEach(index => {
        window.dispatchEvent(new CustomEvent(
          'gamepadAxis',
          {
            detail:
            {
              controller: i,
              axis: index,
              state: newState.axes[index]
            }
          }
        ));
        //console.log(JSON.stringify({controller: i, axis: index, state: newState.axes[index]}));
      });
    }
  };

  const scanGamepads = () => {
    var gamepads = window.navigator.getGamepads ? window.navigator.getGamepads() : (window.navigator.webkitGetGamepads ? window.navigator.webkitGetGamepads() : []);
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        if (gamepads[i].index in gamepadStates) {
          gamepadStates[gamepads[i].index].gamepad = gamepads[i];
        } else {
          addGamepad(gamepads[i]);
        }
      }
    }
  }

  window.addEventListener('gamepadconnected', connecthandler);
  window.addEventListener('gamepaddisconnected', disconnecthandler);

  if (!haveEvents) {
    setInterval(scanGamepads, 500);
  }
}
