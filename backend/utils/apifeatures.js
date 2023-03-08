class ApiFeatures {
    constructor(query, queryStr){
        this.query = query;
        this.queryStr = queryStr;
    }


    //this finds all the products with the searched keyword
    search(){
        const keyword = this.queryStr.keyword ? {
            name:{
                $regex:this.queryStr.keyword,
                $options: "i",
            },
        }:{}
        //  console.log(this.query);
        // console.log(keyword);
        this.query = this.query.find({...keyword});
       return this;
    }

    //this gives only of the searched category.. like watch, electronics, laptop  
    filter(){
        const queryCopy = {...this.queryStr}

        //   Removing some fields for category
        const removeFields = ["keyword","page","limit"];
 
        removeFields.forEach((key) => delete queryCopy[key]);
        

        // Filter For price and Rating

        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
        
    }


    pagination(resultsPerPage) {
        const currentPage = Number(this.queryStr.page) || 1;

        const skip = resultsPerPage * (currentPage - 1);

        this.query = this.query.limit(resultsPerPage).skip(skip);

        return this;
    }
}

module.exports = ApiFeatures;