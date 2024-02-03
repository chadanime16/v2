function scrollToTop() {
    let e = document.documentElement.scrollTop || document.body.scrollTop;
    e > 0 && (window.requestAnimationFrame(scrollToTop), window.scrollTo(0, e - e / 8));
}

const htmlBody = document.querySelector("html, body"),
    resultsContainer = document.getElementById("results"),
    searchInput = document.getElementById("search-input"),
    searchButton = document.getElementById("search-button"),
    corsProxy = "https://corsproxy.io/?";

function optimisedImageUrl(e) {
    return e.replace("._V1_.", "._V1_QL75_UX160_.");
}

function fetchAndShow() {
    let e = encodeURIComponent(searchInput.value);
    let t = `https://vidsrc.to/embed/movie/${e}`;

    Pace.restart();
    fetch(t)
        .then(response => response.json())
        .then(data => {
            resultsContainer.innerHTML = "";

            data.forEach(item => {
                if (item.id && item.type === "movie") {
                    let result = document.createElement("div");
                    result.classList.add("result");
                    result.setAttribute("IMDB", item.id);

                    let link = `<a onClick="setUrl(this); return setVideo(this);" url="imdb=${item.id}" class="links" href="https://vidsrc.to/embed/movie/${item.id}" target="_blank">
                        <img alt="${item.title}" src="${optimisedImageUrl(item.image)}">
                        <div class="info">
                            <h3>${item.title}</h3>
                            <p>${item.description}</p>
                        </div>
                    </a>`;
                    result.innerHTML = link;
                    resultsContainer.appendChild(result);
                }
            });
        })
        .catch(error => console.error(error));
}

function setUrl(e) {
    let t = e.getAttribute("url");
    window.history.replaceState({}, "", `?${t.replace(/%20/g, "+")}`);
}

function setVideo(e) {
    let t = document.getElementById("iframe");
    let s = document.getElementById("video");
    t.src = e.getAttribute("href");
    s.style.display = "block";

    let i = document.getElementById("webSeriesData");
    i.innerHTML = "";

    let imdbId = e.getAttribute("IMDB");
    if (Pace) {
        Pace.restart();
    }
    scrollToTop();
    window.dispatchEvent(new PopStateEvent("popstate"));

    if (e.getAttribute("isWebSeries") === "true") {
        async function fetchSeriesData() {
            let response = await fetch(`https://api.themoviedb.org/3/find/${imdbId}?api_key=YOUR_TMDB_API_KEY&language=en-US&external_source=imdb_id`);
            let seriesData = await response.json();
            let seriesId = seriesData.tv_results[0].id;

            let seriesDetailsResponse = await fetch(`https://api.themoviedb.org/3/tv/${seriesId}?api_key=YOUR_TMDB_API_KEY&language=en-US`);
            let seriesDetails = await seriesDetailsResponse.json();

            let numberOfSeasons = seriesDetails.number_of_seasons;

            i.innerHTML += "<h2>Seasons:</h2>";

            for (let seasonNumber = 1; seasonNumber <= numberOfSeasons; seasonNumber++) {
                i.innerHTML += `<h3>Season ${seasonNumber}:</h3><br>`;
                let seasonContainer = document.createElement("div");
                seasonContainer.classList.add("episode-container");
                let episodesHtml = "";

                let seasonResponse = await fetch(`https://api.themoviedb.org/3/tv/${seriesId}/season/${seasonNumber}?api_key=YOUR_TMDB_API_KEY&language=en-US`);
                let seasonData = await seasonResponse.json();

                for (let episode of seasonData.episodes) {
                    let episodeNumber = episode.episode_number;
                    let formattedEpisodeNumber = episodeNumber.toLocaleString("en-US", {
                        minimumIntegerDigits: 2,
                        useGrouping: !1
                    });

                    episodesHtml += `<a class="episodes" title="${seriesDetails.name}: E${formattedEpisodeNumber}. ${episode.name}" cssidentification="s${seasonNumber}e${episodeNumber}" url="imdb=${imdbId}&season=${seasonNumber}&episode=${episodeNumber}&title=${seriesDetails.name.replace(/ /g, "_") + "_E" + formattedEpisodeNumber + "_" + episode.name.replace(/ /g, "_")}" onClick="event.preventDefault();setVideo(this);setUrl(this);" href="https://vidsrc.to/embed/tv/${imdbId}/${seasonNumber}/${episodeNumber}">E${formattedEpisodeNumber}. ${episode.name}</a>`;
                }

                seasonContainer.innerHTML = episodesHtml;
                i.appendChild(seasonContainer);

                episodeHighlight();
            }
        }

        i.innerHTML = "";
        fetchSeriesData();
    }
}

searchInput.addEventListener("keyup", function () {
    let e = this;
    clearTimeout(timer);
    timer = setTimeout(function () {
        updateURL(e);
        fetchAndShow();
        window.dispatchEvent(new PopStateEvent("popstate"));
        scrollToResults();
    }, 500);
});

searchButton.addEventListener("click", function () {
    fetchAndShow();
    window.dispatchEvent(new PopStateEvent("popstate"));
    scrollToResults();
});

// Assuming there is a button with id "scrollToResultsButton"
document.getElementById("scrollToResultsButton").addEventListener("click", function () {
    scrollToResults();
});

function scrollToResults() {
    let e = resultsContainer.offsetTop;
    htmlBody.scrollTo({ top: e, behavior: "smooth" });
}

function setAll(e, t, s, i, l) {
    if (e && t && !s && !i && l) {
        let r = document.createElement("a");
        r.setAttribute("onClick", "setUrl(this); return setVideo(this);");
        r.setAttribute("url", `imdb=${e}&type=movie&title=${t.replace(/ /g, "_")}`);
        r.setAttribute("isWebSeries", "false");
        r.setAttribute("title", t);
        r.setAttribute("class", "links");
        r.setAttribute("IMDB", e);
        r.setAttribute("href", `https://vidsrc.to/embed/movie/${e}`);
        r.setAttribute("target", "_blank");
        r.click();
    } else if (e && t && i && !l) {
        let a = document.createElement("a");
        a.setAttribute("onClick", "setUrl(this); return setVideo(this);");
        console.log("season setall", s, "episode", i);
        a.setAttribute("url", `imdb=${e}&season=${s}&episode=${i}`);
        a.setAttribute("isWebSeries", "true");
        a.setAttribute("title", t);
        a.setAttribute("class", "links");
        a.setAttribute("IMDB", e);
        a.setAttribute("href", `https://vidsrc.to/embed/tv/${e}/${s}/${i}`);
        a.setAttribute("target", "_blank");
        a.click();
    }
}

const fetchTitle = async e => {
    let t = `https://corsproxy.io/https://v3.sg.media-imdb.com/suggestion/x/${e}.json`;
    try {
        let s = await fetch(t);
        let i = await s.json();
        let l = i.d[0].l;
        return l;
    } catch (r) {
        console.error(r);
    }
};

function updateURL(e) {
    let t = e.value;
    t ? window.history.replaceState({}, "", `?search=${encodeURIComponent(t).replace(/%20/g, "+")}`) : window.history.replaceState({}, "", window.location.pathname);
}

function highlightCards() {
    let e = new URLSearchParams(window.location.search).get("imdb");
    try {
        document.querySelectorAll(".result").forEach(function (e) {
            e.className = "result";
        });
        document.querySelector(`div[IMDB=${e}]`).className = "result hoverClass";
    } catch (t) {}
}

fillSearchInput();

window.onpopstate = function () {
    let e = new URLSearchParams(window.location.search),
        t = e.get("search"),
        s = e.get("imdb");
    if (t || s) {
        let i = document.getElementsByClassName("information");
        for (let l = 0; l < i.length; l++) i[l].style.display = "none";
    } else {
        let r = document.getElementsByClassName("information");
        for (let a = 0; a < r.length; a++) r[a].style.display = "block";
    }
};

let timer;

function episodeHighlight(e = "s1e1") {
    document.querySelectorAll(".episodes").forEach(function (e) {
        e.className = "episodes";
    });
    document.querySelector(`.episodes[cssidentification='${e}']`).className = "episodes selected";
}

// Continue from where the code left off...
// Add any other necessary event listeners or functions as needed
// ...

// The rest of the original code...
// Continue from where the code left off...

// The rest of the original code...

// Highlight the selected episodes on page load
highlightCards();

// Fetch and show results based on the URL parameters
fetchAndShow();

// Handle popstate event when the back/forward buttons are clicked
window.onpopstate = function () {
    let e = new URLSearchParams(window.location.search),
        t = e.get("search"),
        s = e.get("imdb");

    if (t || s) {
        let i = document.getElementsByClassName("information");
        for (let l = 0; l < i.length; l++) i[l].style.display = "none";
    } else {
        let r = document.getElementsByClassName("information");
        for (let a = 0; a < r.length; a++) r[a].style.display = "block";
    }
};

// Optional: Add any other necessary event listeners or functions as needed
// ...

// End of the code.
