export class toolBtn {
    constructor(domID) {
        this.el = document.getElementById(domID)
        this.support = false
    }
    setSupport(support) {
        this.support = support
    }
    disable() {
        if (this.support)
            this.el.disabled = true
    }
    enable() {
        if (this.support)
            this.el.disabled = false
    }
    show() {
        if (this.support)
            this.el.style.display = 'unset'
    }
    hidden() {
        if (this.support)
            this.el.style.display = 'none'
    }
}

export class diskGroup {
    constructor(domID) {
        this.el = document.getElementById(domID)
        this.support = false
        this.diskNames = []
        this.innerHTML = ""
        this.rendered = false
    }
    isNameExist(name) {
        for (let i in this.diskNames) {
            if (name === this.diskNames[i]) {
                return true
            }
        }
        return false
    }
    setSupport(support) {
        this.support = support
    }
    setDisks(disks) {
        if (!this.support)
            this.support
        for (let _i in disks) {
            let used = disks[_i].total - disks[_i].free
            let usedPercentage = Math.ceil(used / disks[_i].total * 100)
            let _disName = disks[_i].name
            let usedH = used
            let totalH = disks[_i].total
            let unitCnt = 0 // 0:B 1.KB 2:MB 3:GB
            let unitChar = ['B', 'KB', 'MB', 'GB']
            while (totalH > 1024) {
                totalH = totalH / 1024
                usedH = usedH / 1024
                unitCnt++
            }
            totalH = totalH.toFixed(1)
            usedH = usedH.toFixed(1)

            if (!this.rendered) {
                if (this.isNameExist(_disName)) {
                    alert(_disName + "already exists")
                } else {
                    this.innerHTML += (`
                    <div class="progressWrapper">
                        <span>
                            ${_disName}
                        </span>
                        <span class="diskPercentage" id="${_disName}Percentage">
                        ${usedH}${unitChar[unitCnt]}/${totalH}${unitChar[unitCnt]}
                        </span>
                        <div class="progress">
                            <div class="progressbar" id="${_disName}Bar" style="width:${usedPercentage}%;">
                            &nbsp;${usedPercentage}%&nbsp;
                            </div>
                        </div>
                    </div>
                    `)
                }
            } else {
                let _elProgressbar = document.getElementById(_disName + 'Bar')
                let _eldiskPercentage = document.getElementById(_disName + 'Percentage')
                _elProgressbar.style.width = `${usedPercentage}%`
                _elProgressbar.innerHTML = `&nbsp;${usedPercentage}%&nbsp;`
                _eldiskPercentage.innerHTML = `${usedH}${unitChar[unitCnt]}/${totalH}${unitChar[unitCnt]}`
            }

        }

        if (!this.rendered) {
            this.el.innerHTML = this.innerHTML
            this.rendered = true
        }

    }
}