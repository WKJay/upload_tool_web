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
            if (!this.rendered) {
                if (this.isNameExist(_disName)) {
                    alert(_disName + "already exists")
                } else {
                    this.innerHTML += (`
                    <div class="progressWrapper">
                        <span>
                            ${_disName}
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
                let _el = document.getElementById(_disName + 'Bar')
                _el.style.width = `${usedPercentage}%`
                _el.innerHTML = `&nbsp;${usedPercentage}%&nbsp;`
            }

        }

        if (!this.rendered) {
            this.el.innerHTML = this.innerHTML
            this.rendered = true
        }

    }
}