const app = require('express')()
const http = require('http').createServer(app)
app.get('/', (req, res) => {
   res.send("Welcome!!")
})

const io = require('socket.io')(http)


//get data from IQ+
const net = require('net')
const { send } = require('process')
const port_iqp = 8888
const host = '203.128.77.46'
// const host = '192.168.1.30'

const client = new net.Socket();

client.connect({port:port_iqp,host:host},function(){
    console.log('getting')
})

count = 0
news = ''
all_news = []
temp_title = ''

client.on('data', function(chunk){
    string = chunk.toString().split('\r\n')
    str = string[0].toString().split('|')
    // console.log(str)

    //remove index when array size 100
    if(all_news.length == 100){
        all_news.shift()
    }

    //select if news
    if(str[1] == 'd'){
        // console.log(str)
        //news
        newsLength = str[3]
        newsIndex = str[4]
        newsDate = str[6]
        newsTime = str[7]
        newsTag = str[9]
        newsTitle = str[10]
        text = str[11]
        
        if(newsLength == 0){
            if(all_news.length > 1){
                if(all_news[all_news.length-1].title.replace(' ','') == newsTitle.replace(' ','')){
                    all_news.pop()
                }
            }

            all_news.push({
                'title':newsTitle,
                'tag':newsTag,
                'date':newsDate,
                'time':newsTime,
                'news':text
            })

            // json = JSON.stringify(all_news)
            // console.log(json)

        }else if(newsLength > newsIndex){
            
            if(temp_title != ''){
                if(temp_title == newsTitle){
                    count++
                }else{
                    news = ''
                    count = 1
                }
            }
            news += text
            temp_title = newsTitle
        }else if(newsLength == newsIndex){
            temp_title = newsTitle
            if(news != ''){
                if(all_news.length > 1){
                    if(all_news[all_news.length-1].title.replace(' ','') == newsTitle.replace(' ','')){
                        all_news.pop()
                    }
                }
                if(count == newsLength){
                    news += text
                    all_news.push({
                        'title':newsTitle,
                        'tag':newsTag,
                        'date':newsDate,
                        'time':newsTime,
                        'news':news
                    })
        
                    // json = JSON.stringify(all_news, null, 3)
                    // console.log(json) 
                } 
                news = ''
                count = 0
                
            }
        }

    }
})

app.get('/news', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    json = JSON.stringify(all_news, null, 3)
    res.send(json)
})


io.on('connection',(socket)=>{
	console.log('connected +1')
    // socket.on('news',(data)=>{
    //     socket.broadcast.emit('receive_message',data)
    // })
})
http.listen(8080)
