i am building a express like framework , so i am trying to implement middlewares exactly like express.  

if there is gloabl middlewares like:

app.use(looger())
app.use(cors())

then every api routes will first go through this global middleware before reaching the api routes

then if api middlewares

app.use("/api/user", auth, isApproved, userRoute) 
then the api will go through the global middlware obusly after going through the global middleware it will go through the api middleware if it pass the next() then it will go to the next middleware or routehandler or handler

app.get("/create", rateLimit, isPremium, createPost)
here the "/create" api will first go through the global middleware then it will go through the rateLimit middleware then it will go through the isPremium middleware then it will go to the createPost handler

i want to implement like this exacly like express.js

implement this be carefull make no mistake at any cost write clean industry standard and production ready code and clean and scalable code