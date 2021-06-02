export default function wasiox(options) {
    if (options == null) console.error('no options')
    if (options.method == null) console.error('no method')
    if (options.url == null) console.error('no url')

    let xhr = new XMLHttpRequest()
    xhr.open(options.method, options.url)
    if (options.uploadProgress) xhr.upload.onprogress = options.uploadProgress
    if (options.error) xhr.onerror = options.error
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
                if (options.success)
                    options.success(JSON.parse(xhr.responseText))
            } else {
                if (options.error)
                    options.error()
            }
        }
    }
    if (options.data) xhr.send(data)
    else xhr.send()
}