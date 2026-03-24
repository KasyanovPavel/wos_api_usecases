import axios from "axios";
import { JOURNALSAPIKEY, EXPANDEDAPIKEY } from "./apikeys.js";

export async function validationApiCall(query) {

    let params = {
        databaseId: "WOS",
        usrQuery: query,
        count: 0,
        firstRecord: 1
    }

    try {
        let validationRequest = await axios.get(
            "https://api.clarivate.com/api/wos",
            {
                params: params,
                headers: {"X-ApiKey": EXPANDEDAPIKEY},
                timeout: 16000
            }
        );

        return validationRequest

    } catch (error) {

            if (error.response) {
                return {
                    status: error.response.status,
                    text: JSON.stringify(error.response.data, null, 2)
                };
            }
        }
}


export async function expandedApiCall(query, firstRecord) {

    let params = {
        databaseId: "WOS",
        usrQuery: query,
        count: 100,
        firstRecord: firstRecord
    }

    try {
        let response = await axios.get(
            "https://api.clarivate.com/api/wos",
            {
                params: params,
                headers: {"X-ApiKey": EXPANDEDAPIKEY},
                timeout: 16000
            }
        );

        return response

    } catch (error) {

        if (error.response) {
            return {
                status: error.response.status,
                text: JSON.stringify(error.response.data, null, 2)
            };
        }
    }
}

export async function journalMetricsCall(journal, year) {
    try {
        let metricsRequest = await axios.get(
            `https://api.clarivate.com/apis/wos-journals/v1/journals/${journal}/reports/year/${year}`,
            {
                headers: {"X-ApiKey": JOURNALSAPIKEY},
                timeout: 16000
            }
        );

        return metricsRequest

    } catch (error) {

        if (error.response) {
            return {
                status: error.response.status,
                text: JSON.stringify(error.response.data, null, 2)
            };
        }
    }
}

export async function journalProfileCall(journal) {

    try {

        const profileRequest = await axios.get(
            `https://api.clarivate.com/apis/wos-journals/v1/journals/${journal}`,
            {
                headers: { "X-ApiKey": JOURNALSAPIKEY },
                timeout: 16000
            }
        );

        const reports = profileRequest?.data?.journalCitationReports ?? [];

        const year = reports.length
            ? Math.max(...reports.map(r => Number(r.year)).filter(Number.isFinite))
            : null;

        return year;

    } catch (error) {

        if (error.response) {
            return {
                status: error.response.status,
                text: JSON.stringify(error.response.data, null, 2)
            };
        }
    }
}