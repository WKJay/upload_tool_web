import "../css/index.css"
import waxios from "./waxios"
import {
    toolBtn,
    diskGroup
} from "./domClass"
var crc32 = require('crc-32')

const VERSION = "1.0.1"


function $(id) {
    return document.getElementById(id)
}

function webAlert(msg) {
    window.setTimeout(() => {
        alert(msg)
    }, 500);
}

let basePathInputTimer = null

let deviceSupport = {
    firmwareupload: false,
    fileupload: false,
    directoryupload: false,
    diskclean: false,
    diskfree: false,
    filecheck: false,
    filelist: false //暂不支持
}
let fileCheckList = {
    length: 0,
    files: []
};
let uploadFileSize = 0;
let percent = 0;
let pt = $('uploadText')
let uploadBtn = $("uploadBtn")
let fileBtn = $("fileBtn")
let fileType = $("fileType")
let fileUpload = $("fileupload")
let uploadPath = $("uploadPath")
let fileList = $("fileList")
let uploadListWrapper = $("uploadListWrapper")
let checkFilesBtn = new toolBtn("checkFilesBtn")
let cleanDiskBtn = new toolBtn("cleanDiskBtn")
let disks = new diskGroup("diskGroup")

/* disk related */
let diskFreeTimer = null
let diskFreeTimerFlag = true

function isAjaxSuccess(xhr) {
    if (xhr.status >= 200 && xhr.status < 300) {
        return true
    } else {
        return false
    }
}

function fileCheckListClean() {
    fileCheckList.length = 0;
    fileCheckList.files = [];
    fileListDOMUpdate();
}

function basePathUpdate() {
    window.clearTimeout(basePathInputTimer);
    basePathInputTimer = window.setTimeout(() => {
        fileCheckListUpdate(fileUpload.files);
    }, 10);
}

function fileChooseDisable(flag) {
    if (flag) {
        fileType.disabled = true;
        fileBtn.disabled = true;
    } else {
        fileType.disabled = false;
        fileBtn.disabled = false;
    }
}

function fileListDOMUpdate() {
    let listHTML = ""
    let checkState = ""
    let stateColor = "red"
    let filePathShow = ""
    let _fileNameLen = 45
    if (fileType.value != 0) {
        for (let i in fileCheckList.files) {
            let fileObj = fileCheckList.files[i]
            if (fileObj.checked == 0) { //未验证
                checkState = "not checked"
                stateColor = "gray"
            } else if (fileObj.checked == 1) { //验证成功
                checkState = "success"
                stateColor = "green"
            } else if (fileObj.checked == -1) { //验证失败
                checkState = "error"
                stateColor = "red"
            }

            if (deviceSupport.filecheck)
                _fileNameLen = 25
            else
                _fileNameLen = 45

            if (fileObj.path.length > _fileNameLen) {
                filePathShow = fileObj.path.slice(0, _fileNameLen) + "..."
            } else {
                filePathShow = fileObj.path;
            }
            if (deviceSupport.filecheck)
                listHTML += `
            <tr>
                <td style="width:60%"title=${fileObj.path}>${filePathShow}</td>
                <td style="width:40%;color:${stateColor};text-align:right">${checkState}&nbsp;&nbsp;</td>
            </tr>
            `
            else
                listHTML += `
            <tr>
                <td style="width:60%"title=${fileObj.path}>${filePathShow}</td>
            </tr>
            `
        }
        if (fileCheckList.length > 0) {
            checkFilesBtn.enable();
        } else {
            checkFilesBtn.disable();
        }
    } else {
        listHTML = "";
    }

    fileList.innerHTML = listHTML;

}

function fileCheckListinvoke(cb) {
    if (fileCheckList.length != fileCheckList.files.length) {
        window.setTimeout(() => {
            fileCheckListinvoke(cb);
        }, 100);
    } else {
        cb();
    }
}

function fileCheckListUpdate(fileObj) {
    let pathBase = uploadPath.value;
    fileCheckList.files = [];
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
                            path: pathBase + '/' + (file.webkitRelativePath == "" ? file.name : file.webkitRelativePath),
                            crc: crc32.buf(new Uint8Array(reader.result)) >>> 0,
                            checked: 0
                        });
                    }

                }

            } else {
                webAlert("invalid file object");
            }
        }
        fileCheckListinvoke(fileListDOMUpdate);
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
                fnt.innerHTML = file.name.slice(0, 20) + " ... " + file.name.slice(file_obj.name.length -
                    5);
            } else {
                fnt.innerHTML = file.name;
            }
            uploadFileSize = file.size;
            fst.innerHTML = file.size + " bytes";
        }
        uploadBtn.disabled = false;
        checkFilesBtn.enable();
    } else {
        fnt.innerHTML = "";
        fst.innerHTML = "";
        uploadBtn.disabled = true;
        checkFilesBtn.disable();
    }
};

function cleanChosenFiles() {
    fileUpload.value = "";
    fileCheckListClean();
    checkFile();
}

function setUploadBtn(status) {
    uploadBtn.disabled = false;
    fileChooseDisable(false);
    if (status == "success") {
        $("pg-bar").style.background = "#67c23a";
        pt.innerHTML = 'UPLOAD';
    } else if (status == "error") {
        $("pg-bar").style.background = "#f56c6c";
        pt.innerHTML = 'UPLOAD';
    } else if (status == "check_file") {
        uploadBtn.disabled = true;
        checkFilesBtn.disable();
        fileChooseDisable(true);
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
    if (typeVal == 0) {
        checkFilesBtn.hidden();
        uploadListWrapper.style.display = "none";
    } else {
        checkFilesBtn.show();
        uploadListWrapper.style.display = "block";
    }
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
    checkFilesBtn.disable();
    fileChooseDisable(true);

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
            checkFilesBtn.enable();
        } else {
            let resp = JSON.parse(xhr.responseText);
            if (resp.code == "0") {
                if (resp.filesize == uploadFileSize) {
                    if (fileType.value == '0') {
                        //固件升级无需校验文件
                        uploadSuccess(true, 'firmware uploading success')
                    } else {
                        if (deviceSupport.filecheck) {
                            setUploadBtn("check_file")
                            //这里需要等待checklist异步更新完后才能进行检测
                            fileCheckListinvoke(() => {
                                fileUploadCheck(() => {
                                    uploadSuccess(true, 'upload successfully, all files have been checked')
                                }, (successCnt, failCnt) => {
                                    uploadSuccess(false, failCnt + ' file(s) failed to check,please reupload')
                                })
                            });
                        } else {
                            uploadSuccess(true, 'upload successfully')
                        }
                    }
                } else {
                    checkFilesBtn.enable()
                    uploadSuccess(false)
                }
            } else {
                checkFilesBtn.enable()
                uploadSuccess(false)
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

function handleDeviceSupport() {
    let _ds = deviceSupport;
    if (!_ds.directoryupload) {
        $('dirUploadOption').style.display = 'none'
    } else {
        fileType.value = "2"
    }
    if (!_ds.fileupload) {
        $('fileUploadOption').style.display = 'none'
    } else {
        fileType.value = "1"
    }
    if (!_ds.firmwareupload) {
        $('firmUploadOption').style.display = 'none'
    } else {
        fileType.value = "0"
    }

    if (_ds.diskclean) cleanDiskBtn.show()
    // if (_ds.filecheck) $('checkFilesBtn').style.display = 'unset'
    updateFileBtnValue()
}

function handshake() {
    let version_tip = $("verNameTip")
    waxios({
        method: 'get',
        url: '/cgi-bin/handshake',
        success: (data) => {
            if (data.code == 0) {
                let _ds = deviceSupport
                version_tip.innerHTML = data.handshake.version

                if (data.handshake.support_firmwareupload != null) _ds.firmwareupload = data.handshake.support_firmwareupload
                if (data.handshake.support_fileupload != null) _ds.fileupload = data.handshake.support_fileupload
                if (data.handshake.support_directoryupload != null) _ds.directoryupload = data.handshake.support_directoryupload
                if (data.handshake.support_diskclean != null) _ds.diskclean = data.handshake.support_diskclean
                if (data.handshake.support_diskfree != null) _ds.diskfree = data.handshake.support_diskfree
                if (data.handshake.support_filecheck != null) _ds.filecheck = data.handshake.support_filecheck
                if (data.handshake.support_filelist != null) _ds.filelist = data.handshake.support_filelist
                checkFilesBtn.setSupport(_ds.filecheck)
                cleanDiskBtn.setSupport(_ds.diskclean)
                handleDeviceSupport()
            } else {
                version_tip.innerHTML = "read failed";
            }
        },
        error: () => {
            version_tip.innerHTML = "read failed";
        }
    })
}

function getDiskFree() {
    if (!diskFreeTimerFlag)
        return
    diskFreeTimerFlag = false
    waxios({
        method: 'get',
        url: '/cgi-bin/get_diskfree',
        timeout: 10000,
        success: (data) => {
            if (data.code == 0) {
                disks.setDisks(data.disks)
                diskFreeTimerFlag = true
            }
        },
        error: () => {
            diskFreeTimerFlag = true
        }
    })

}

function fileUploadCheck(success, err) {
    let xhr = new XMLHttpRequest();
    uploadBtn.disabled = true;
    /* make request */
    let request = {
        length: fileCheckList.length,
        files: []
    };
    for (let i in fileCheckList.files) {
        request.files.push({
            id: i,
            path: fileCheckList.files[i].path
        });
    }

    xhr.open('post', '/cgi-bin/upload_check');
    xhr.onload = function () {
        if (!isAjaxSuccess(xhr)) {
            err();
        } else {
            let errFlag = 0;
            let checkFail = 0;
            let checkSuccess = 0;
            let resp = JSON.parse(xhr.responseText);
            if (resp.code == 0) {
                let respList = {};
                //request.files中的数组下标对应其元素的id，该id在
                //resp.result中对应了key
                for (let i in request.files) {
                    respList[request.files[i].path] = resp.result[i];
                }
                for (let i in fileCheckList.files) {
                    let key = fileCheckList.files[i].path;
                    if (fileCheckList.files[i].crc != respList[key]) {
                        fileCheckList.files[i].checked = -1;
                        errFlag = 1;
                    } else {
                        fileCheckList.files[i].checked = 1;
                        checkSuccess++;
                    }
                }
                checkFail = fileCheckList.files.length - checkSuccess;
            } else {
                errFlag = 1;
            }
            if (errFlag) {
                err(checkSuccess, checkFail);
            } else {
                success(checkSuccess, checkFail);
            }
            fileChooseDisable(false)
            fileListDOMUpdate();

        }
        uploadBtn.disabled = false;
    };
    xhr.send(JSON.stringify(request));
}

function updateFileBtnValue() {
    if (fileType.selectedOptions[0].value == "-1") {
        fileBtn.value = "Disabled"
        fileBtn.style.display = 'none'
    } else {
        fileBtn.value = "Choose " + fileType.selectedOptions[0].text;
        fileBtn.style.display = 'unset'
    }

}

function diskClean() {
    let ret = window.prompt('This action cannot be undone.\nThis will permanently clean the whole disk and lose all data.\nPlease type the name of the disk to confirm.')
    if (ret != null && ret != "") {
        waxios({
            method: 'post',
            url: '/cgi-bin/diskclean',
            timeout: 10000,
            data: {
                disk_name: ret
            },
            success: (data) => {
                if (data.code == 0) {
                    alert("clean " + ret + " success")
                } else {
                    alert(data.msg)
                }
            }
        })
    }
}

function init() {
    handshake()
    getDiskFree()
    diskFreeTimer = window.setInterval(getDiskFree, 2000)
    fileUpload.onchange = checkFile
    fileUpload.onclick = () => {
        cleanChosenFiles()
    };
    $("version").innerHTML = "V" + VERSION;
    fileType.onchange = fileTypeChange
    fileBtn.onclick = () => {
        fileUpload.click()
    }
    updateFileBtnValue();
    uploadBtn.onclick = upload;
    checkFilesBtn.el.onclick = () => {
        fileUploadCheck(() => {
            webAlert("all files were checked successfully");
        }, (successCnt, failCnt) => {
            if (successCnt == undefined || failCnt == undefined) {
                webAlert("failed to check");
            } else {
                webAlert(successCnt + " checked，" + failCnt + " failed to check");
            }

        })
    };
    cleanDiskBtn.el.onclick = diskClean
    uploadPath.oninput = basePathUpdate
}

window.onload = () => {
    init()
}