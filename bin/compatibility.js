var CompatibilityMonster = function() {
    this.svg = false;
    this.file = false;
    this.filereader = false;
    this.filelist = false;
    this.blob = false;
    this.download_attr = false;
    this.selectClickType = {
        mouse: 'click',
        touch: 'touchstart',
        pointer: 'pointerdown'
    };
    this.selectDownType = {
        mouse: 'mousedown',
        touch: 'touchstart',
        pointer: 'pointerdown'
    };
    this.selectUpType = {
        mouse: 'mouseup',
        touch: 'touchend',
        pointer: 'pointerup'
    };
    this.file_api = function() {
        return (this.file && this.filereader && this.filelist && this.blob) ? true : false;
    };
    this.mssaveblob = function() {
        return typeof window.navigator.msSaveBlob == 'function';
    };
    this.os = function() {
        try {
            return window.navigator.platform;
        } catch (e) {
            return '';
        }
    };
    this.windows = function() {
        return (this.os.toUpperCase().indexOf('WIN') > -1);
    };
    this.local_downloading = function() {
        return (this.download_attr || (this.blob && this.mssaveblob()));
    };
    this.istouchable = function() {
        return 'ontouchend' in document;
    };
    this.selectClickEvent = function() {
        if (window.navigator.msPointerEnabled) {
            return this.selectClickType.pointer;
        } else if(this.istouchable()) {
            return this.selectClickType.touch;
        } else {
            return this.selectClickType.mouse;
        }
    };
    this.selectDownEvent = function() {
        if(window.navigator.msPointerEnabled) {
            return this.selectDownType.pointer;
        } else if(this.istouchable()) {
            return this.selectDownType.touch;
        } else {
            return this.selectDownType.mouse;
        }
    };
    this.selectUpEvent = function() {
        if(window.navigator.msPointerEnabled) {
            return this.selectUpType.pointer;
        } else if(this.istouchable()) {
            return this.selectUpType.touch;
        } else {
            return this.selectUpType.mouse;
        }
    }
    this.enterable = function() {
        return 'ontouchenter' in document;
    };
    this.moveable = function() {
        return 'ontouchmove' in document;
    };

    var t = this;

    function init() {
        t.svg = svg();
        t.file = file();
        t.filereader = filereader();
        t.filelist = filelist();
        t.blob = blob();
        t.download_attr = download_attr();
    }

    function svg() {
        return document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1");
    }

    function file() {
        return (window.File) ? true : false;
    }

    function filereader() {
        return (window.FileReader) ? true : false;
    }

    function filelist() {
        return (window.FileList) ? true : false;
    }

    function blob() {
        return (window.Blob) ? true : false;
    }

    function download_attr() {
        return 'download' in document.createElement('a');
    }

    init();
};