# act-crawler-results-deduplicate

This acts takes crawler execution results and deduplicates them.

__Example input:__
```javascript
{
    "_id": "EXECUTION_ID",
    "data": "{
        \"compareKey\": \"YOUR_COMPARE_KEY\"
    }"
}
```

The optional "data" attribute must be a stringified JSON and can contain a "compareKey" attribute.
This key is used to select an object attribute for comparison. If no key is provided, whole object will be used for comparison.
__It is expected to be called from a crawler webhook.__
