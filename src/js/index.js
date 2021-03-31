import "../css/index.css"
var md5 = require('js-md5')

const VERSION = "1.0.1"


function $(id) {
    return document.getElementById(id);
}

function webAlert(msg) {
    window.setTimeout(() => {
        webAlert(msg);
    }, 500);
}

var fileCheckList = {
    length: 0,
    files: []
};
let uploadFileSize = 0;
let percent = 0;
let pt = $('uploadText');
let uploadBtn = $("uploadBtn");
let fileBtn = $("fileBtn");
let fileType = $("fileType");
let fileUpload = $("fileupload");
let uploadPath = $("uploadPath");

function isAjaxSuccess(xhr) {
    if (xhr.status >= 200 && xhr.status < 300) {
        return true;
    } else {
        return false;
    }
}

function fileCheckListClean() {
    fileCheckList.length = 0;
    fileCheckList.files = [];
}

function fileCheckListinvoke(cb) {
    if (fileCheckList.length != fileCheckList.files.length) {
        window.setTimeout(fileCheckListShow, 100);
    } else {
        cb();
    }
}

function fileCheckListUpdate(fileObj) {
    let pathBase = uploadPath.value;
    if (FileReader) {
        fileCheckList.length = fileObj.length;
        for (let i = 0; i < fileObj.length; i++) {
            let file = fileObj[i];
            if (file) {
                if (file.webkitRelativePath == undefined) {
                    webAlert("no webkitRelativePath parameter");
                } else {
                    let reader = new FileReader();
                    reader.readAsArrayBuffer(file);
                    reader.onload = function () {
                        fileCheckList.files.push({
                            path: pathBase + file.webkitRelativePath,
                            md5: md5(reader.result),
                            checked: 0
                        });
                    }

                }

            } else {
                webAlert("invalid file object");
            }
        }
    } else {
        webAlert("FileReader not implemented in this browser");
    }
}

function checkFile() {
    let file_obj = fileUpload.files;
    let fnt = $('fileNameTip');
    let fst = $('fileSizeTip');

    setUploadBtn("reset");
    if (file_obj.length) {
        fileCheckListUpdate(file_obj);
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
    fileCheckListClean();
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
    } else if (status == "check_file") {
        uploadBtn.disabled = true;
        pt.innerHTML = 'CHECKING';
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
    let typeVal = fileType.value;
    cleanChosenFiles();
    updateFileBtnValue();
    if (typeVal == 2) {
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

function uploadSuccess(success, msg) {
    if (success) {
        if (msg) {
            webAlert(msg);
        } else {
            webAlert("upload success");
        }
        setUploadBtn("success");
    } else {
        if (msg) {
            webAlert(msg);
        } else {
            webAlert("upload failed");
        }
        setUploadBtn("error");
    }
}

function upload() {
    let xhr = new XMLHttpRequest();
    let basePath = uploadPath.value == "" ? uploadPath.placeholder : uploadPath.value;
    setUploadBtn("origin");
    uploadBtn.disabled = true;
    fileBtn.disabled = true;

    if (fileType.value == '0') {
        xhr.open('post', '/upload/app');
    } else if (fileType.value == '1') {
        xhr.open('post', `/upload/file?path=${basePath}`);
    } else if (fileType.value == '2') {
        xhr.open('post', `/upload/directory?path=${basePath}`);
    }

    xhr.onload = function () {
        if (!isAjaxSuccess(xhr)) {
            uploadSuccess(false, "function not supported")
        } else {
            let resp = JSON.parse(xhr.responseText);
            if (resp.code == "0") {

                if (resp.filesize == uploadFileSize) {
                    setUploadBtn("check_file");
                    //这里需要等待checklist异步更新完后才能进行检测
                    fileCheckListinvoke(() => {
                        fileUploadCheck(() => {
                            uploadSuccess(true, 'success');
                        }, () => {
                            uploadSuccess(false, 'check failed');
                        })
                    });
                } else {
                    uploadSuccess(false);
                }
            } else {
                uploadSuccess(false);
            }
        }
    };
    xhr.upload.onprogress = function (event) {
        percent = (event.loaded / event.total * 100).toFixed(0) + '%';
        pt.innerHTML = percent;
        $("pg-bar").style.width = percent;
    };
    xhr.onerror = function () {
        uploadSuccess(false, "error occurs");
    };
    let data = new FormData(document.querySelector('form'));
    xhr.send(data);
};

function getCurrentVersion() {
    let xhr = new XMLHttpRequest();
    let version_tip = $("verNameTip");
    xhr.open("get", '/cgi-bin/get_version');
    xhr.onload = function () {
        if (!isAjaxSuccess(xhr)) {
            version_tip.innerHTML = "read failed";
        } else {
            let resp = JSON.parse(xhr.responseText);
            version_tip.innerHTML = resp.version;
        }
    };
    xhr.send();
}

function fileUploadCheck(success, err) {
    let xhr = new XMLHttpRequest();
    xhr.open('post', '/cgi-bin/upload_check');
    xhr.onload = function () {
        if (!isAjaxSuccess(xhr)) {
            err();
        } else {
            let errFlag = 0;
            let resp = JSON.parse(xhr.responseText);
            for (let i in fileCheckList.files) {
                let id = fileCheckList.files[i].path;
                if (fileCheckList.files[i].md5 != resp.result[id]) {
                    fileCheckList.files[i].checked = -1;
                    errFlag = 1;
                } else {
                    fileCheckList.files[i].checked = 1;
                }
            }
            if (errFlag) {
                err();
            } else {
                success();
            }
            fileBtn.disabled = false;

        }
    };
    xhr.send(JSON.stringify(fileCheckList));
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
    fileType.onchange = fileTypeChange;
    fileBtn.onclick = () => {
        fileUpload.click();
    }
    updateFileBtnValue();
    uploadBtn.onclick = upload;
}

init();