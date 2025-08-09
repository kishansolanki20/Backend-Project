class ApiError extends Error {
  constructor(message ="Something went wrong", statusCode, errors = [], statck="")
  {
    super(message);
    this.statusCode = statusCode;
    this.data= null
    this.message = message
    this.success = false
    this.errors = errors
    this.stack = statck
    
    if(statck) {
        this.stack = statck
    }else {
        Error.captureStackTrace(this, this.constructor)
    }
  }
}

export default ApiError