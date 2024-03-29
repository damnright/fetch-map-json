import http from 'axios'
import fs from 'fs'

const baseUrl = 'http://datavmap-public.oss-cn-hangzhou.aliyuncs.com/areas/'

function ug(sort, code1, code2 = '00') {
    return baseUrl + sort + '/51' + code1 + code2 + '.json'
}

function promisify(fn, t, argsNum = 3) { //t:this  args:参数个数
    return (...args) => {
        let arr = Array.from(args).slice(0, argsNum - 2)
        return new Promise((resolve, reject) => {
            fn.call(t, ...arr, args[argsNum - 2] || {}, (err, res) => {
                return err ? reject(err) : resolve(res)
            })
        })
    };
}

const rmdir = promisify(fs.rmdir, fs),
    mkdir = promisify(fs.mkdir, fs),
    appendFile = promisify(fs.appendFile, fs, 4)

const children = [...Array(35).keys()]
const bound = [...Array(100).keys()]
bound.shift()

//并发
async function getConcurrent() {
    try {
        await rmdir('./map', {recursive: true})
        await mkdir('./map', {recursive: true})
    } catch (e) {
        console.log(e)
    }
    children.map(async (i) => {
        let code1 = i.toString().padStart(2, '0')
        try {
            let r = await http.get(ug('children', code1))
            await (async (r) => {
                await console.log('获取children/51' + code1 + '00成功')
                await appendFile('./map/51' + code1 + '00.json', JSON.stringify(r.data))
                await console.log('保存children/51' + code1 + '00成功')
            })(r)
        } catch (e) {
        }
        await bound.map(async (j) => {
            let code2 = j.toString().padStart(2, '0')
            try {
                let r = await http.get(ug('bound', code1, code2))
                await (async (r) => {
                    await console.log('###获取bound/51' + code1 + code2 + '成功')
                    await appendFile('./map/51' + code1 + code2 + '.json', JSON.stringify(r.data))
                    await console.log('###保存bound/51' + code1 + code2 + '成功')
                })(r)
            } catch (e) {
            }
        })
    })
}

//继发for of
async function getConcurrentByForOf() {
    try {
        await rmdir('./map', {recursive: true})
        await mkdir('./map', {recursive: true})
    } catch (e) {
        console.log(e)
    }
    for (const i of children){
        let code1 = i.toString().padStart(2, '0')
        try {
            let r = await http.get(ug('children', code1))
            await (async (r) => {
                await console.log('获取children/51' + code1 + '00成功')
                await appendFile('./map/51' + code1 + '00.json', JSON.stringify(r.data))
                await console.log('保存children/51' + code1 + '00成功')
            })(r)
        } catch (e) {
        }
        for (const j of bound){
            let code2 = j.toString().padStart(2, '0')
            try {
                let r = await http.get(ug('bound', code1, code2))
                await (async (r) => {
                    await console.log('###获取bound/51' + code1 + code2 + '成功')
                    await appendFile('./map/51' + code1 + code2 + '.json', JSON.stringify(r.data))
                    await console.log('###保存bound/51' + code1 + code2 + '成功')
                })(r)
            } catch (e) {
            }
        }
    }
}

//继发for循环
async function getSuccessive() {
    try {
        await rmdir('./map', {recursive: true})
        await mkdir('./map', {recursive: true})
    } catch (e) {
        console.log(e)
    }

    for (let i = 0; i < 35; i++) {
        let code1 = i.toString().padStart(2, '0')
        try {
            let r = await http.get(ug('children', code1))
            await (async (r) => {
                await console.log('获取children/51' + code1 + '00成功')
                await appendFile('./map/51' + code1 + '00.json', JSON.stringify(r.data))
                console.log('保存children/51' + code1 + '00成功')
            })(r)
        } catch (e) {
        }

        for (let j = 1; j < 100; j++) {
            let code2 = j.toString().padStart(2, '0')
            try {
                let r = await http.get(ug('bound', code1, code2))
                await (async (r) => {
                    await console.log('###获取bound/51' + code1 + code2 + '成功')
                    await appendFile('./map/51' + code1 + code2 + '.json', JSON.stringify(r.data))
                    console.log('###保存bound/51' + code1 + code2 + '成功')
                })(r)
            } catch (e) {
            }
        }
    }
}

function run(option = false) {
    option ? getSuccessive() : getConcurrent()
}

run()