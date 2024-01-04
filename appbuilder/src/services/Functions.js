async function selectType(type) {
    if(type === 'authorized') {
        return {
            BaseDropStatus: "1100.01",
            TransactionId: "AUTHORIZE_RETURN.0003",
        }
    } else if(type === 'approved') {
        return {
            BaseDropStatus: "3950.001",
            TransactionId: "APPROVE_RETURN.0003.ex",
        }
    } else if(type === 'restock'){
        return {
            BaseDropStatus: "3950.004",
            TransactionId: "Restock.0003.ex",
        }
    } else if(type === 'unreceive'){
        return {
            BaseDropStatus: "3780",
            TransactionId: "UNRECEIVE_UNAPPROVED_ORD.0003.ex",
        }
    } else if(type === 'createMemo'){
        return {
            BaseDropStatus: "3950.003",
            TransactionId: "CREATE_RETURN_MEM.0003.ex",
        }
    }
}

export { selectType }