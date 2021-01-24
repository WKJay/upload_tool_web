const VERSION = "1.0.0"

function $(id) {
    return document.getElementById(id);
}

var uploadFileSize = 0;
var percent = 0;
var pt = $('uploadText');

function checkFile() {
    var file_obj = $("fileupload").files[0];
    var fnt = $('fileNameTip');
    var fst = $('fileSizeTip');
    var btn = $("uploadBtn");

    percent = 0;
    $('pg-bar').style.width = percent;

    if (file_obj) {
        if (file_obj.name.length > 20) {
            fnt.innerHTML = file_obj.name.slice(0, 15) + " ... " + file_obj.name.slice(file_obj.name.length -
                5);
        } else {
            fnt.innerHTML = file_obj.name;
        }
        uploadFileSize = file_obj.size;
        fst.innerHTML = file_obj.size + " bytes";
        btn.disabled = false;
    } else {
        btn.disabled = true;
    }
};

function fileTypeChange() {
    let type = $("file_type").value;
    if (type == 2) {
        $("fileupload").webkitdirectory = true;
        $("fileupload").directory = true;
    } else {
        $("fileupload").webkitdirectory = false;
        $("fileupload").directory = false;
    }
}

function upload() {
    var xhr = new XMLHttpRequest();
    var type = $("file_type");
    if (type.value == '0') {
        xhr.open('post', '/app');
    } else {
        xhr.open('post', '/filesystem');
    }

    xhr.onload = function () {
        if (xhr.status == 404) {
            percent = 0;
            pt.innerHTML = '0%';
            $("pg-bar").style.width = percent;
            alert("communication error");
        } else {
            var resp = JSON.parse(xhr.responseText);
            $("fileWrSucce").innerHTML = resp.filesize + " bytes";
            if (resp.code == "0") {
                if (resp.filesize == uploadFileSize) {
                    alert("upload success");
                } else {
                    alert("upload failed");
                    percent = 0;
                    pt.innerHTML = '0%';
                    $("pg-bar").style.width = percent;
                }
            } else {
                alert("upload failed");
                percent = 0;
                pt.innerHTML = '0%';
                $("pg-bar").style.width = percent;
            }
        }
    };
    xhr.upload.onprogress = function (event) {
        percent = (event.loaded / event.total * 100).toFixed(0) + '%';
        pt.innerHTML = percent;
        $("pg-bar").style.width = percent;
    };
    var data = new FormData(document.querySelector('form'));
    xhr.send(data);
};

function getCurrentVersion() {
    var xhr = new XMLHttpRequest();
    var version_tip = $("verNameTip");
    xhr.open("get", '/cgi-bin/get_version');
    xhr.onload = function () {
        if (xhr.status == 404) {
            version_tip.innerHTML = " ";
        } else {
            var resp = JSON.parse(xhr.responseText);
            version_tip.innerHTML = resp.version;
        }
    };
    xhr.send();
}

function init() {
    getCurrentVersion();
    $("fileupload").onchange = checkFile;
    $("uploadBtn").onclick = upload;
    $("file_type").onchange = fileTypeChange;
    $("version").innerHTML = "V" + VERSION;
}

init();
