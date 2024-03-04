const http = require("http");
const {v4:uuidv4} = require('uuid');
let todos = [];
const errorHandler = require('./errorHandle');

function requestListener(request,response) {
    const headers = {
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
       'Content-Type': 'application/json'
     }

     let body = "";

     request.on('data',chunk => {
        body+=chunk
     })


    if(request.url === '/todos' && request.method === 'GET') {
        response.writeHead(200,headers)
        response.write(JSON.stringify(
            {
                "status":"success",
                "data":todos
            }
        ))
        response.end()
    }else if(request.url === '/todos' && request.method === 'POST') {
        try {
            request.on('end',()=>{
                const title  = JSON.parse(body).title;
                if((title !== undefined) && (title !== "")) {
                    const todo = {
                        'title':title,
                        'id':uuidv4()
                    };
                    todos.push(todo);
                    response.writeHead(200,headers)
                    response.write(JSON.stringify(
                        {
                            "status":"success",
                            "data":todos
                        }
                    ))
                    response.end()
                } else if(title === "") {
                    errorHandler(response,"不能為空值");
                } else {
                    errorHandler(response,"資料格式錯誤，或無此todo id");
                } 

            })
        } catch(error){
            errorHandler(response,"資料格式錯誤，或無此todo id")
        }
        
    }else if(request.url === '/todos' && request.method === 'DELETE') {
        todos = [];
        response.writeHead(200,headers)
        response.write(JSON.stringify(
            {
                "status":"success",
                "data":todos,
            }
        ))
        response.end()
    }else if(request.url.startsWith('/todos/') && request.method === 'DELETE') {
        const id = request.url.split('/').pop();
        let getDeleteIndex = -1;
        todos.forEach((todo,index)=>{
            if(todo.id === id) {
                getDeleteIndex = index;
            }
        });
        if(getDeleteIndex !== -1) {
            todos.splice(getDeleteIndex,1);
            response.writeHead(200,headers)
            response.write(JSON.stringify(
                {
                    "status":"success",
                    "data":todos,
                }
            ))
            response.end()
        } else {
            errorHandler(response,"無此todo id");
        }

    }else if(request.url.startsWith('/todos/') && request.method === 'PATCH') {
        request.on('end',()=> {
            try{
                const todo = JSON.parse(body).title;
                const id = request.url.split("/").pop();
                const index = todo.findIndex(ele=> ele.id === id)
                if(todo !== undefined && index !== -1) {
                    todos[index].title = todo;
                    response.writeHead(200,headers)
                    response.write(JSON.stringify(
                        {
                            "status":"success",
                            "data":todos
                        }
                    ))
                    response.end();
                } else {
                    errorHandler(response,'編輯失敗，欄位填寫錯誤，或無此id')
                }
            }catch{
                errorHandler(response,'編輯失敗，資料錯誤')
            }
        })

    }else if(request.method === 'OPTIONS') {
        response.writeHead(200,headers)
        response.end()
    } else {
        response.writeHead(404,headers)
        response.write(JSON.stringify(
            {
                "status":"success",
                "message":"無此網站路由"
            }
        ))
        response.end()
    }
    
}

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3005);