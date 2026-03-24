# Web of Science Journal Metrics Tracker via Web of Science Expanded API and Journals API

![Screenshot](/screenshots/screenshot.png)

## A JavaScript application with a simple graphical user interface that links journal publications to their respective Journal Impact Factors and Quartiles. The application retrieves the data using Web of Science Expanded and Journals API.

As a company we don't encourage our users to use the journal metrics for evaluating individual research publications. There are many factors influencing this, but, most importantly, the journal impact is rarely equal to an individual article's impact. If you'd like to read more about the science behind this, please refer to the following articles:

- [Lutz Bornmann, Werner Marx, Armen Yuri Gasparyan, George D. Kitas. Diversity, value and limitations of the journal impact factor and alternative metrics. Rheumathology Journal, 2012; 32; 1861:1867](https://link.springer.com/article/10.1007/s00296-011-2276-1)
- [Garfield, Eugene. The History and Meaning of the Journal Impact Factor. Journal of American Medical Association, 2006, 295(1): 90-93, DOI:10.1001/jama.295.1.90](https://jamanetwork.com/journals/jama/article-abstract/202114)
- [Seglen, PO. Why the impact factor of journals should not be used for evaluating research. British Medical Journal, 1997; 314:497, DOI:10.1136/bmj.314.7079.497](https://www.bmj.com/content/314/7079/497.1.full)

A featue that would allow users to see the journal metrics for the individual articles on the same screen has ben requested for a long time, but the fact that we are intentially not adding it into Web of Science platform doesn't mean it's impossible to create these report by accessing Web of Science and Journal Citation Reports data via respective APIs.

This application allows you to send an Advanced Search Query to Web of Science via Web of Science Expanded API, retrieve the document metadata with it, and then query the Journals API for the relevant journal metrics, render a table of document records with their Journal Impact Factors and quartiles, and save the same data into a tab-delimited file.


#### How to use it
Download the code, open the project folder where you saved it and create there an `apikeys.js` file. There, you need to create two constants representing your Web of Science Expanded API key and Journals API key, and pass their value as strings like in the example below:

```
export const EXPANDEDAPIKEY = "mYw3b0f$c14nc33xp4nd3d4p1k3y1$4$3cr37";
export const JOURNALSAPIKEY = "mYj0uRn4l$4p1k3y1$n07v3rYpU6l1c317h3r";
```

You might also need to install the project dependencies, which are:
- Axios;
- Express;
- EJS;
- Nodemon.

And launch the index.js file - wth nodemon, it's going to be a nodemon index.js terminal command. It will create a development server on http://127.0.0.1:3000 which you can open locally in any browser. This is what the start page looks like:

![Start page](screenshots/start_page.png)

On the webpage, you can enter a Web of Science Core Collection Advanced Search query, i.e., for an affiliation search on Clarivate for publication year of 2021-2024 (you can simply replace Clarivate with your organisation name):

```
OG=Clarivate and PY=2021-2024
```

You can then select whether you require the Journal Impact Factors for the publication years of the journals or whether just having the most recent Journal Impact Factor value available should be sufficiant, and press the "Run" button. Two important details to consider: the Journal Impact Factors for any publication year are becoming available in the summer of the subsequent year, so if you strictly require the journal metrics for the documents published in the current year, they might be unavailable yet. Also please note that as Web of Science Expanded API has a limit of 100,000 records to be retrieved per search query, it is a good idea to validate your search if you're not sure how many records it's going to return.

The data retrieval should take some time. The retrieval process is going to be reflected on a progress bar on the same webpage. 

When the data extraction is complete, the program will refresh the page and add an HTML table with the key parameters of each publication, including the Journal Impact Factor value and the best quartile for this journal. It will also save a .tsv file with this metadata retrieved into the /downloads/ subfolder of the project folder.

This application was created to demonstrate the capabilities of Web of Science APIs and custom XML data, and is not a commercial product of Clarivate. It will be reviewed and updated in the future but it will not have the same regular update frequency we normally offer for our commercial products. We do not recommend using this application as a ready-made solution as it is for reporting purposes or for supporting important grant funding decisions. We however encourage the bibliometric community to provide feedback on improving this script and to use the script as a base for more advanced analytical projects.

For a consistent experience, intuitive user interface and world-class customer support, please refer to our products like Web of Science, InCites Benchmarking & Analytics, and Journal Citation Reports.
