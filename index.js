const url = "https://pokeapi.co/api/v2/pokemon/ditto"
const fetchData = ()=> fetch(url);

async function retry(fn,n){
    for (let i=0; i<n; n++){
        try{
            const response = await fn();
            return response.json()
        } catch (error){
            if (i === n-1){
                throw(error);
            }
        }
    }
}

retry(fetchData,3).then(response=>console.log(response))