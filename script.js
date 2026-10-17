const form = document.getElementById("searchform");
const input = document.getElementById("researchinput");
const results = document.getElementById("results");
const minYearInput = document.getElementById("minYear");

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const query = input.value.trim();
    const minYear = Number(minYearInput.value) || 0;

    if (!query) {
        return;
    }

    results.replaceChildren();

    const loading = document.createElement("p");
    loading.textContent = "Searching for matching research...";
    results.appendChild(loading);

    try {
        const url =
            "https://api.openalex.org/works?search=" +
            encodeURIComponent(query) +
            "&filter=open_access.is_oa:true&per_page=100";

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("The search request failed.");
        }

        const data = await response.json();

        results.replaceChildren();

        let pdfCount = 0;

        for (const paper of data.results) {

            // Filter by minimum publication year
            if (
                minYear > 0 &&
                (
                    !paper.publication_year ||
                    paper.publication_year < minYear
                )
            ) {
                continue;
            }

            const locations = paper.locations || [];

            const pdfLocation = locations.find(
                location => location.pdf_url
            );

            const pdfUrl =
                pdfLocation?.pdf_url ||
                paper.best_oa_location?.pdf_url;

            if (!pdfUrl) {
                continue;
            }

            const result = document.createElement("div");
            const title = document.createElement("h3");
            const year = document.createElement("p");
            const link = document.createElement("a");
            const sourceLink = document.createElement("a");
            sourceLink.classList.add("research-source");

            result.classList.add("research-result");
            title.classList.add("research-title");
            year.classList.add("research-year");
            link.classList.add("research-pdf");

            title.textContent =
                paper.display_name || "Untitled research";

            year.textContent = paper.publication_year
                ? "Published: " + paper.publication_year
                : "Publication year unavailable";

            link.href = pdfUrl;
            link.textContent = "Download PDF";
            link.target = "_blank";
            link.rel = "noopener noreferrer";

            sourceLink.href = paper.id;
            sourceLink.textContent = "Open Link";
            sourceLink.target = "_blank";
            sourceLink.rel = "noopener noreferrer";

            const details = document.createElement("div");
            details.classList.add("research-details");

            details.appendChild(year);
            details.appendChild(title);
            details.appendChild(sourceLink);

            result.appendChild(details);
            result.appendChild(link);
            

            results.appendChild(result);

            pdfCount++;
        }

        if (pdfCount === 0) {
            const message = document.createElement("p");

            message.textContent =
                "No matching PDFs found for your search and selected year.";

            results.appendChild(message);
        }

    } catch (error) {
        results.replaceChildren();

        const message = document.createElement("p");

        message.textContent =
            "Unable to search. Check your internet connection and try again.";

        results.appendChild(message);

        console.error("Search error:", error);
    }
});
