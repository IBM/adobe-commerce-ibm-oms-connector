async function getResponse(data, status) {
    return {
        body: { data, status },
        statusCode: 200,
    }
}

async function getErrorResponse(error, status) {
    return {
        "status": status,
        "error": error
    }
}

export { getResponse, getErrorResponse }