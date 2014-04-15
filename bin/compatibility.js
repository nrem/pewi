var CompatibilityMonster = function() {
    this.svg = false;
    this.file = false;
    this.filereader = false;
    this.filelist = false;
    this.blob = false;
    this.download_attr = false;
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
        return (this.os.toUpperCase().indexOf('WIN') > -1) ? true : false;
    };

    var t = this;

    function init() {
        this.svg = svg();
        this.file = file();
        this.filereader = filereader();
        this.filelist = filelist();
        this.blob = blob();
        this.download_attr = download_attr();
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
}