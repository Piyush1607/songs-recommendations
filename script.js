const clientId=`5a0e443b093c4bb18540eaa25c151113`
const clientSecret=`c94c3a8604c845aa8aaa5a71740d5f06`
const newsContainer = document.querySelector('.maincontent')
const categories = document.querySelector('.categories')
const songContent = document.querySelector('.songs-list');



const getToken = async () => {

    const result = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/x-www-form-urlencoded', 
            'Authorization' : 'Basic ' + btoa(clientId + ':' + clientSecret)
        },
        body: 'grant_type=client_credentials'
    });

    const data = await result.json();
    // console.log(data.access_token)
    return data.access_token;
}

const getGenres = async () => {

    const token = await getToken()
    
    const result = await fetch(`https://api.spotify.com/v1/browse/categories?locale=sv_US`, {
        method: 'GET',
        headers: { 'Authorization' : 'Bearer ' + token}
    });
    
    const data = await result.json();
    // console.log(data)
    return data.categories.items;
}


//  <li class="category-item"><a href="">Entertainment</a></li> 

const getTracks = async (tracksEndPoint) => {
    const token = await getToken()
    const limit = 10;
    // console.log(tracksEndPoint)
    const result = await fetch(`${tracksEndPoint}?limit=${limit}`, {
        method: 'GET',
        headers: { 'Authorization' : 'Bearer ' + token}
    });
    
    const data = await result.json();
    // console.log(data.tracks.items.slice(0,20))
    return data.tracks.items.slice(0,30)
}

const getTrack = async ( trackEndPoint) => {
    const token = await getToken();
    console.log(trackEndPoint)
    const result = await fetch(`${trackEndPoint}`, {
        method: 'GET',
        headers: { 'Authorization' : 'Bearer ' + token}
    });

    const data = await result.json();
    console.log(data)
    return data;
}
const getPlaylistByGenre = async ( genreId) => {
    const token = await getToken()
    const limit = 10;
    
    const result = await fetch(`https://api.spotify.com/v1/browse/categories/${genreId}/playlists?limit=${limit}`, {
        method: 'GET',
        headers: { 'Authorization' : 'Bearer ' + token}
    });

    const data = await result.json();   
    console.log(data)
    return data.playlists.items;
}

getToken()
getGenres()

const init = async()=>{
    const items = await getGenres()
    // console.log(items);
    const markup = items.slice(1,17).map(genre=>{
        return `
        <li class="category-item"><a href="" data-id="${genre.id}">${genre.name}</a></li> 
        `
    }).join('')

    categories.innerHTML=markup 
}

init()

const getPlaylist=async function(url){
    try {
        const res = await fetch(url)
        const data = await res.json();
        if(!res.ok)throw new Error(`${res.status} ${data.message}`)
        // console.log(data);
        return data;
    } catch (error) {
        throw error
    }
}

const renderSongList = (playlist)=>{
    const markup = playlist.map(album=>{
        return `
        <li class="song">
            <img src="${album.track.album.images[0].url}" class="song-img" alt="">
            <a href="${album.track.external_urls.spotify}" target="_blank" class="demo">${album.track.name}</a>
        </li>`
    }).join('\n')
    // console.log(markup);
    songContent.innerHTML=markup;
}

const renderPlaylist = async function(playlists){
    let markup=playlists.map(playlist => {
        return `
            <li class="title">
                <a href="${playlist.href}" class="demo">${playlist.name}</a>
            </li>
        `
    }).join('');
    markup = ` <h3 style="margin-left: 2%; font-size: 40px;">SONGS</h3>
    <ul class="news-content">
                ${markup}
             </ul>`
    newsContainer.innerHTML=markup
}

categories.addEventListener('click',async function(e){
    e.preventDefault()
    if(!e.target.closest('a')) return 
    const playlists = await getPlaylistByGenre(e.target.dataset.id)
    // console.log(playlists);
    renderPlaylist(playlists)
})

document.querySelector('.maincontent').addEventListener('click', async function(e){
    e.preventDefault();
    if(!e.target.closest('.demo')) return
    const endPoint=e.target.href;
    const tracks = await getTracks(endPoint)
    renderSongList(tracks)
})

