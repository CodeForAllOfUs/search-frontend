import EventEmitter from 'classes/event-emitter';
import ListContainerView from 'views/list-container';
import ListView from 'views/list';

class ListController extends EventEmitter {
    constructor(opts = {}) {
        super();
        // local data
        this.chunkSize = opts.chunkSize || 1;
        this.sortKey = 'id';
        this.isSortAsc = true;

        // model
        // hold the results to render out chunks at a time
        this.model = [];

        // views
        this.listContainerView = new ListContainerView({
            el: opts.el,
        });
        this.listView = new ListView({
            el: opts.el + ' .list',
            template: opts.listTemplate,
        });

        this.init();
    }

    init() {
        this.addListeners();
    }

    addListeners() {
        this.listContainerView.on('sort', this.sortBy.bind(this));
        this.listView.on('requestNextChunk', this.appendChunk.bind(this));
    }

    sortBy(key) {
        function sortAsc(a, b) {
            var i;
            // drill down into object if `key` used dot notation
            for (i = 0; i < keys.length; ++i) {
                a = a[keys[i]];
                b = b[keys[i]];
            }
            return a < b ? -1 : 1;
        }

        var keys;

        if (this.sortKey === key) {
            this.isSortAsc = !this.sortAsc;
            this.model.reverse();
        } else {
            keys = key.split('.');
            this.sortKey = key;
            this.isSortAsc = true;
            this.model.sort(sortAsc);
        }

        this.render();
    }

    render(model = this.model) {
        var firstChunk = model.slice(0, this.chunkSize);
        var isListEmpty = firstChunk.length === 0;

        // cancel appending any pending next chunks
        clearTimeout(this.loadTimer);
        this.loadTimer = null;
        this.listContainerView.hideLoading();

        this.model = model;
        this.listContainerView.render(isListEmpty, this.sortKey, this.isSortAsc);
        this.listView.render(firstChunk);
        this.loadBelowFold();
    }

    appendChunk(startIndex) {
        var listView = this.listView;
        var listContainerView = this.listContainerView;
        var model = this.model;
        var chunkSize = this.chunkSize;

        listContainerView.showLoading();

        if (this.loadTimer) {
            return;
        }

        // simulate API fetching
        //
        // since typing in the search will change the results,
        // keeping track of this timer can prevent rendering chunks
        // from a previous search after they return from an API call.
        this.loadTimer = setTimeout(() => {
            listView.receiveNextChunk(model.slice(startIndex, startIndex + chunkSize));
            listContainerView.hideLoading();
            this.loadTimer = null;
        }, 1000);
    }

    // make sure the data is at least rendered below the fold,
    // so that user scrolling triggers infinite scroll afterward
    loadBelowFold() {
        var loadDelay = 300;
        var listView = this.listView;
        setTimeout(function loadAgain() {
            if (listView.canDoInfiniteScroll()) {
                listView.doInfiniteScroll();
                setTimeout(loadAgain, loadDelay);
            }
        }, loadDelay);
    }
}

export default ListController;
