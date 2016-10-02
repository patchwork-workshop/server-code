(function() {
    let socket = io();
    let MODES = [
        'rotate',
        'Vline',
        'Hline',
        'inout',
        'snake',
        'random',
        'blink'
    ];
    let autoTransitionTimer;
    let currentMode = 0;
    if (document.readyState != 'loading') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            init();
        });
    }

    function init() {
        attachListeners();
        enableAutoTransition(true);
    }

    function attachListeners() {
        let items = document.querySelectorAll('#mode-collection .item > img');
        for (item of items) {
            item.addEventListener('click', (evnt) => submitMode(event.target.dataset.mode));
        }
    }

    function submitMode(mode) {
        socket.emit('newMessageReceived', MODES[mode]);
    }
    socket.on('upcoming', (mode) => changeMode(mode));

    function changeMode(mode) {
        let item = document.querySelector('#mode-collection .item > img[data-mode="' + MODES[mode] + '"]');
        let currentItem = document.querySelector('#current-mode .item');
        currentItem.innerHTML = "";
        currentItem.appendChild(item.cloneNode());
        currentMode = mode;
    }

    function enableAutoTransition(enable) {

        if (enable) {
            autoTransitionTimer = setInterval(() => {
                submitMode((++currentMode < MODES.length) ? ((currentMode) => {
                    return currentMode;
                })(currentMode) : ((currentMode) => {
                    currentMode = 1;
                    return currentMode;
                })(currentMode));
            }, 20000);
        } else {
            removeInterval(autoTransitionTimer);
        }
    }
})();