async function runSearch(formData) {

    const params = new URLSearchParams(formData);

    const response = await fetch("/", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";

    while (true) {

        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");

        buffer = lines.pop();

        for (const line of lines) {

            if (!line.trim()) continue;

            const data = JSON.parse(line);

            if (data.type === "progress") {

                updateProgress(data.percent, data.label);

            } else if (data.type === "result") {

                displayResults(data.publicationData, data.filename);

            }
        }
    }

    setButtonsDisabled(false);
}

function setButtonsDisabled(disabled) {
    document.querySelectorAll('button[name="button"]').forEach(btn => {
        btn.disabled = disabled;
    });
}

function updateProgress(percent, label) {

    document.getElementById("progress-bar").style.width = percent + "%";
    document.getElementById("progress-label").innerText = label ? `${label}: ${percent}%` : "";
}

function displayResults(publicationData, filename) {
    let container = document.getElementById("table-container");

    if (!container) {
        container = document.createElement("div");
        container.id = "table-container";
        document.body.appendChild(container);
    }

    let html = `
        <div class="table-wrapper">
            <table class="table" id="table">
                <colgroup>
                    <col style="width: 10%">
                    <col style="width: 10%">
                    <col style="width: 20%">
                    <col style="width: 15%">
                    <col style="width: 15%">
                    <col style="width: 10%">
                    <col style="width: 10%">
                </colgroup>
                <thead>
                    <tr>
                        <th class="table__cell table__cell--header">UT</th>
                        <th class="table__cell table__cell--header">Publication Date</th>
                        <th class="table__cell table__cell--header">Document Title</th>
                        <th class="table__cell table__cell--header">Source Title</th>
                        <th class="table__cell table__cell--header">Times Cited</th>
                        <th class="table__cell table__cell--header">Journal Impact Factor</th>
                        <th class="table__cell table__cell--header">JIF Quartile</th>
                    </tr>
                </thead>
                <tbody>
    `;

    publicationData.forEach(record => {
        html += `
            <tr>
                <td class="table__cell"><p class="table__recordUt">${record.uid}</p></td>
                <td class="table__cell"><p class="table__pubDate">${record.publicationDate}</p></td>
                <td class="table__cell"><p class="table__docTitle">${record.documentTitle}</p></td>
                <td class="table__cell"><p class="table__srcTitle">${record.sourceTitle}</p></td>
                <td class="table__cell"><p class="table__timesCited">${record.timesCited}</p></td>
                <td class="table__cell"><p class="table__JIF">${record.journalImpactFactor || 'N/A'}</p></td>
                <td class="table__cell"><p class="table__JIF">${record.journalBestQuartile || 'N/A'}</p></td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = html;

    if (filename) {
        const messageElem = document.getElementById("download-message");
        messageElem.textContent = `Retrieval complete. For further analysis, check "${filename}" file in the /downloads subfolder of the project.`;
    }
}

document.querySelector("form").addEventListener("submit", function(e) {
    
    if (e.submitter.value !== "run") return;

    e.preventDefault();

    const formData = new FormData(this);
    formData.append("button", "run");

    setButtonsDisabled(true)

    runSearch(formData);
});