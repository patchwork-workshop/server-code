var socket = io();
var MODES = [
    'rotate',
    'Vline',
    'Hline',
    'inout',
    'snake',
    'random',
    'blink'
];
(function() {
    if (document.readyState != 'loading') {
        attachListeners();
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            attachListeners();
        });
    }

    function attachListeners() {
        let items = document.querySelectorAll('#mode-collection .item > img');
        for (item of items) {
            item.addEventListener('click', (evnt) => submitMode(evnt));
        }
    }

    function submitMode(evnt) {
        let mode = event.target.dataset.mode;
        console.log(mode);
        socket.emit('newMessageReceived', mode);
    }
    socket.on('upcoming', (mode) => changeMode(MODES[mode]));

    function changeMode(mode) {
        console.log(mode);
        let item = document.querySelector('#mode-collection .item > img[data-mode="' + mode + '"]');
        let currentItem = document.querySelector('#current-mode .item');
        currentItem.innerHTML = "";
        currentItem.appendChild(item.cloneNode());
    }
})();