const path = require('path')
const fse = require('fs-extra')

const sidebarPath = path.join(__dirname, '../../docs/.vitepress/sidebar.js')
const prefix = 'export default '

function genItem(issueData){
    if(issueData.node) issueData = issueData.node
    return { text: `${issueData.title}`, link: `/${issueData.number}` }
}
function genGroup(label){
    return {
        text: label,
        items: []
    }
}

function genSidebar(issues, labels){
    if(labels.length === 1){
        // only one acceptLabel, hide group
        return issues.filter(issue=>{
            return !issue.node.labels.nodes.includes(labels[0])
        }).map(genItem)
    }
    
    const labelMap = {}
    labels.forEach(label=>{
        labelMap[label] = genGroup(label)
    })
    issues.forEach(issue=>{
        for(let label of issue.node.labels.nodes){
            const labelGroup = labelMap[label.name]
            if(!labelGroup) continue
            labelGroup.items.push(genItem(issue))
        }
    })
    return Object.values(labelMap)
}

function _writeFile(sidebar){
    fse.ensureFileSync(sidebarPath)
    fse.writeFileSync(sidebarPath, `${prefix}${JSON.stringify(sidebar)}`)
}


function read(){
    const str = fse.readFileSync(sidebarPath, 'utf-8')
    const newStr = str.replace(prefix, '')
    let sidebar = []
    try{
        sidebar = JSON.parse(newStr)
    }catch(e){
        console.error('JSON parse error.', e)
    }
    return sidebar
}

function write(issues, labels){
    const sidebar = genSidebar(issues, labels)
    _writeFile(sidebar)
}

function remove(number){
    console.log('remove', number)
    const sidebar = read()

    if(sidebar[0]?.link){
        const foundIndex = sidebar.findIndex(item=>item.link.slice(1) === String(number))
        if(foundIndex > -1) sidebar.splice(foundIndex, 1)
    }else if(sidebar[0]?.items){
        for(let group of sidebar){
            const foundIndex = group.items.findIndex(item=>item.link.slice(1) === String(number))
            if(foundIndex > -1) group.items.splice(foundIndex, 1)
        }
    }
    
    _writeFile(sidebar)
}

function update(issueData, labels, acceptLabels){
    const sidebar = read()
    if(sidebar.length === 0) return write([{node: issueData}], labels)
    
    const number = issueData.number
    const handleList = list=>{
        let found = false
        for(let i=0; i<list.length; i++){
            const item = list[i]
            const currentNum = parseInt(item.link.slice(1))
            if(currentNum >= number){
                found = true
                list.splice(i, currentNum === number ? 1 : 0, genItem(issueData))
                break
            }
        }
        if(!found){
            list.push(genItem(issueData))
        }
    }
    
    if(acceptLabels?.length === 1){
        // only one acceptLabel
        handleList(sidebar)
    }else if(acceptLabels.length > 1){
        for(let group of sidebar){
            if(labels.includes(group.text)) {
                handleList(group.items)
            }else{
                const foundIndex = group.items.findIndex(item=>parseInt(item.link.slice(1)) === number)
                if(foundIndex > -1) group.items.splice(foundIndex, 1)
            }
        }
    }

    _writeFile(sidebar)
}

module.exports = {
    read,
    write,
    remove,
    update,
}
