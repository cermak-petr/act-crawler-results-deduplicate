const Apify = require('apify');
const _ = require('underscore');
const Promise = require('bluebird');

Apify.main(async () => {
    Apify.setPromisesDependency(Promise);
    const rowSplit = process.env.MULTIROW ? parseInt(process.env.MULTIROW) : 10;
    
    // get Act input and validate it
    const input = await Apify.getValue('INPUT');
    const data = input.data ? (typeof input.data === 'string' ? JSON.parse(input.data) : input.data) : {};
    if(!input._id){
        return console.log('missing "_id" attribute in INPUT');
    }
    if(!input.data){
        console.log('WARNING: missing "data" attribute in INPUT, row JSON will be used as a deduplication key');
    }
    
    function getKey(value){
        return (input.data && input.data.compareKey && value[input.data.compareKey] !== undefined) ? 
               value[input.data.compareKey] : JSON.stringify(value);
    }
    
    const hashMap = {};
    function processResult(result){
        const key = getKey(result);
        if(!hashMap[key]){hashMap[key] = result;}
    }
    
    function processResults(results){
        _.each(results.items, function(item, index){
            const pfr = item.pageFunctionResult;
            if(pfr){
                if(Array.isArray(pfr) && pfr.length > 0){
                    _.each(pfr, processResult);
                }
                else{processResult(pfr);}
            }
        });
    }
    
    // set global executionId
    Apify.client.setOptions({executionId: input._id});
    
    // loop through pages of results and deduplicate them
    const limit = 200;
    let total = null, offset = 0;
    while(total === null || offset + limit < total){
        const results = await Apify.client.crawlers.getExecutionResults({limit: limit, offset: offset});
        processResults(results);
        total = results.total;
        offset += limit;
    }
    
    await Apify.setValue('OUTPUT', Object.values(hashMap));
});
