import "../css/index.css"

const VERSION = "1.0.0"

function $(id) {
    return document.getElementById(id);
}

function webAlert(msg) {
    window.setTimeout(() => {
        alert(msg);
    }, 500);
}

let uploadFileSize = 0;
let percent = 0;
let pt = $('uploadText');
let uploadBtn = $("uploadBtn");
let fileBtn = $("fileBtn");
let fileType = $("file_type");
let fileUpload = $("fileupload");

function checkFile() {
    let file_obj = fileUpload.files;
    let fnt = $('fileNameTip');
    let fst = $('fileSizeTip');


    setUploadBtn("reset");
    if (file_obj.length) {
        if (file_obj.length > 1) {
            let fileSize = 0;
            fnt.innerHTML = file_obj.length + " files";
            for (let i of file_obj) {
                fileSize += i.size;
            }
            fst.innerHTML = fileSize + " bytes";
            uploadFileSize = fileSize;
        } else {
            let file = file_obj[0];
            if (file.name.length > 20) {
                fnt.innerHTML = file.name.slice(0, 15) + " ... " + file.name.slice(file_obj.name.length -
                    5);
            } else {
                fnt.innerHTML = file.name;
            }
            uploadFileSize = file.size;
            fst.innerHTML = file.size + " bytes";
        }
        uploadBtn.disabled = false;
    } else {
        fnt.innerHTML = "";
        fst.innerHTML = "";
        uploadBtn.disabled = true;
    }
};

function cleanChosenFiles() {
    fileUpload.value = "";
    checkFile();
}

function setUploadBtn(status) {
    uploadBtn.disabled = false;
    if (status == "success") {
        $("pg-bar").style.background = "#67c23a";
        pt.innerHTML = 'UPLOAD';
    } else if (status == "error") {
        $("pg-bar").style.background = "#f56c6c";
        pt.innerHTML = 'UPLOAD';
    } else if (status == "reset") {
        pt.innerHTML = 'UPLOAD'
        $("pg-bar").style.width = 0;
        $("pg-bar").style.background = "rgba(239,239,239)";
    } else if (status == "origin") {
        $("pg-bar").style.width = 0;
        $("pg-bar").style.background = "#409eff";
        uploadBtn.blur();
    }
}

function fileTypeChange() {
    let fntd = $('fileNameTipDisc');
    let fstd = $('fileSizeTipDisc');
    let type = $("file_type").value;
    cleanChosenFiles();
    updateFileBtnValue();
    if (type == 2) {
        fntd.innerHTML = "File Count:";
        fstd.innerHTML = "Directory Size:";
        fileUpload.webkitdirectory = true;
        fileUpload.directory = true;
    } else {
        fntd.innerHTML = "File Name:";
        fstd.innerHTML = "File Size:";
        fileUpload.webkitdirectory = false;
        fileUpload.directory = false;
    }
}

function upload() {
    let xhr = new XMLHttpRequest();
    let type = $("file_type");
    setUploadBtn("origin");
    uploadBtn.disabled = true;

    if (type.value == '0') {
        xhr.open('post', '/upload/app');
    } else if (type.value == '1') {
        xhr.open('post', '/upload/file');
    } else if (type.value == '2') {
        xhr.open('post', '/upload/directory');
    }

    xhr.onload = function () {
        if (xhr.status == 404) {
            webAlert("function not supported");
            setUploadBtn("error");
        } else {
            let resp = JSON.parse(xhr.responseText);
            if (resp.code == "0") {
                if (resp.filesize == uploadFileSize) {
                    webAlert("upload success");
                    setUploadBtn("success");
                } else {
                    webAlert("upload failed");
                    setUploadBtn("error");
                }
            } else {
                webAlert("upload failed");
                setUploadBtn("error");
            }
        }
    };
    xhr.upload.onprogress = function (event) {
        percent = (event.loaded / event.total * 100).toFixed(0) + '%';
        pt.innerHTML = percent;
        $("pg-bar").style.width = percent;
    };
    xhr.onerror = function () {
        webAlert("error occurs");
        setUploadBtn("error");
    };
    let data = new FormData(document.querySelector('form'));
    xhr.send(data);
};

function getCurrentVersion() {
    let xhr = new XMLHttpRequest();
    let version_tip = $("verNameTip");
    xhr.open("get", '/cgi-bin/get_version');
    xhr.onload = function () {
        if (xhr.status == 404) {
            version_tip.innerHTML = " ";
        } else {
            let resp = JSON.parse(xhr.responseText);
            version_tip.innerHTML = resp.version;
        }
    };
    xhr.send();
}

function updateFileBtnValue() {
    fileBtn.value = "Choose " + fileType.selectedOptions[0].text;
}

function init() {
    getCurrentVersion();
    fileUpload.onchange = checkFile;
    fileUpload.onclick = () => {
        cleanChosenFiles();
    };
    $("version").innerHTML = "V" + VERSION;
    uploadBtn.onclick = upload;
    fileType.onchange = fileTypeChange;
    fileBtn.onclick = () => {
        fileUpload.click();
    }
    updateFileBtnValue();
}

init();