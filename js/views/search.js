import { $$, listen, addClass, removeClass } from 'utils/dom';
import EventEmitter from 'classes/event-emitter';

class SearchView extends EventEmitter {
    constructor(opts = {}) {
        super();
        this.el = $$(opts.el)[0];
        this.searchBox = $$('input', this.el)[0];
        this.clearButton = $$('button', this.el)[0];

        this.init();
    }

    init() {
        this.addListeners();
    }

    addListeners() {
        listen(this.searchBox, 'keyup', evt => {
            this.setClearButton();
            this.emit('keyup', evt);
        });

        listen(this.clearButton, 'click', evt => {
            this.searchBox.value = '';
            this.setClearButton();
            this.emit('keyup', evt);
        });
    }

    setClearButton() {
        if (this.searchBox.value === '') {
            addClass(this.clearButton, 'hidden');
        } else {
            removeClass(this.clearButton, 'hidden');
        }
    }
}

export default SearchView;
