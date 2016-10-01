var socket = io();
var modes = ["horizontal scanning", "vertical scanning", "in and out", "snake", "random block", "blink all"];
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
            item.addEventListener('click', (evnt) => changeMode(evnt));
        }
    }

    function changeMode(evnt) {
        let mode = event.target.dataset.mode;
        console.log(mode);
        socket.emit('newMessageReceived', mode);
    }
})();