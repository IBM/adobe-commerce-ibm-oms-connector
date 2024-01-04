async function getResponse(data) {
    return {
        "data": {
            "status": "true"
        }
    }
}
async function getErrorResponse(error) {
    return {
        "error": error
    }
}
export { getResponse, getErrorResponse }