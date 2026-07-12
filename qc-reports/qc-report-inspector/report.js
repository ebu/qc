import * as xmllint from "./node_modules/xmllint-wasm/index-browser.mjs";

const catalogue_api_prefix = "https://qc.ebu.io/api/v2";
let xsd_text = "";
const parser = new DOMParser();

async function validateXMLDoc(xml, schema) {
    try{
        const { valid, rawOutput, normalized } =
        await xmllint.validateXML(
            {
                xml: { fileName: "qc_report_xml_file", contents: xml },
                schema: schema,
                normalization: "format"
            });
        return { valid, rawOutput, normalized };

    } catch(error){
        return { valid: false, rawOutput: error.message, normalized:""};
    }
	
}

async function getFileXMLDoc() {
    const [fileHandle] = await window.showOpenFilePicker();
    const file = await fileHandle.getFile();
    const xml_doc_text = await file.text();
    
    return xml_doc_text;
}

function xmlToBoolean(selector_result) {
    if (selector_result === null)
        {return null;}
    else
    {
        const text = selector_result.textContent;
        if (["true", "1"].includes(text))
            {return true;}
        else if (["false", "0"].includes(text))
            {return false;}
        else
        {
            // XSD validation makes this unexpected
            throw new Error("XML Boolean not formatted as expected");
        }
    }
}

function getExecutionClass(value) {
    if (value == "complete")
        {return "text-bg-success";}
    else 
        {return "text-bg-danger";}
}

function getResultClass(value) {
    if (value === null)
        {return "text-bg-warning";}
    else if (value)
        {return "text-bg-success";}
    else 
        {return "text-bg-danger";}
}

function getResultText(value) {
    if (value === null)
        {return "N/A";}
    else if (value)
        {return "PASS";}
    else 
        {return "FAIL";}
}

function safeText(selector_result, null_text=""){
    if (selector_result === null)
        {return null_text;}
    else {return selector_result.textContent;}
}

function resultsReset(){
    const results_div = document.querySelector("#results");
    results_div.replaceChildren("");
    results_div.classList.add("d-none");
}

function validationMessagesReset(){
    const validation_output_div = document.querySelector("#validation-output"); 
    validation_output_div.replaceChildren("");
    validation_output_div.classList.add("d-none");
}

function validationMessage(title, body, status){
    const validation_output_div = document.querySelector("#validation-output"); 
    validation_output_div.insertAdjacentHTML("beforeend", `<div class="alert alert-${status} role="alert"><strong>${title}</strong><br/>${body}<br/></div>`);
    validation_output_div.classList.remove("d-none");
}

async function processDoc() {

    resultsReset();
    validationMessagesReset();

    const results_div = document.querySelector("#results");

    let xml_doc_text;
    try {
        xml_doc_text = await getFileXMLDoc();  
    } catch (error) {
        results_div.replaceChildren(`UNABLE TO LOAD XML DOCUMENT -- perhaps it's not valid XML`);
        results_div.classList.remove("d-none");
        return false;
    }    
   
    const { valid, rawOutput, normalized } = await validateXMLDoc(xml_doc_text, xsd_text);
    if (!valid)
    {
        validationMessage("XSD Validation failed", `Raw Output: ${rawOutput}`, "danger");
        results_div.replaceChildren(`XSD VALIDATION FAILED`);
        results_div.classList.add("d-none");
        return false;
    } 
    validationMessage("XSD Validation successful", `qc.xsd only; any extensions not validated<br/>Raw Output: ${rawOutput}`, "success");

    const xml_doc = parser.parseFromString(xml_doc_text, "text/xml");

    /////////////////////////////////////////
    // Extract report details and add to HTML
    /////////////////////////////////////////

    const template_results_nav = document.querySelector("#template-results-nav"); 
    results_div.replaceChildren(template_results_nav.content.cloneNode(true));

    const op_div = document.querySelector("#nav-1");
    const qc_div = document.querySelector("#nav-2");
    const eng_div = document.querySelector("#nav-3");

    const template_report_tool_info_button = document.querySelector("#template-report-tool-info-button");
    const template_item_tool_info_button = document.querySelector("#template-item-tool-info-button");
    const template_item_result_card = document.querySelector("#template-item-result-card");
    const template_dropdown = document.querySelector("#template-dropdown");

    // General checks/validation
    
    if (xml_doc.querySelector("Report>ExtensionProperties>TimingExtensionMediaPlaybackEditUnits") === null)
        {validationMessage("TimingExtensionMediaPlaybackEditUnits is missing", "The use of TimingExtensionMediaPlaybackEditUnits is recommended", "warning");}

    const report_check_result_rule = safeText(xml_doc.querySelector("Report>Profile>CheckResultRule"), "AND");
    if (report_check_result_rule == "OR")
        {validationMessage(`CheckResultRule is "OR"`, `CheckResultRule is typically "AND" and defaults to "AND" when not specified`, "info");}
    else if (report_check_result_rule == "MinimumRelevance")
        {validationMessage(`CheckResultRule is "MinimumRelevance"`, `CheckResultRule is typically "AND" and defaults to "AND" when not specified. Report and item results might need to be interpreted differently to the "pass/fail" shown by this tool.`, "warning");}

    // Delivery operator tab

    const report_tool_info_button = template_report_tool_info_button.content.cloneNode(true).querySelector("button");
    report_tool_info_button.setAttribute("data-bs-a", safeText(xml_doc.querySelector("Report>ToolInformation>ToolID")));
    report_tool_info_button.setAttribute("data-bs-b", safeText(xml_doc.querySelector("Report>ToolInformation>ToolName")));
    report_tool_info_button.setAttribute("data-bs-c", safeText(xml_doc.querySelector("Report>ToolInformation>Vendor")));
    report_tool_info_button.setAttribute("data-bs-d", safeText(xml_doc.querySelector("Report>ToolInformation>URL")));
    report_tool_info_button.setAttribute("data-bs-e", safeText(xml_doc.querySelector("Report>ToolInformation>Version")));

    const report_check_result = xmlToBoolean(xml_doc.querySelector("Report>CheckResult"));
    const report_execution_status = safeText(xml_doc.querySelector("Report>ExecutionStatus", "error"));

    op_div.insertAdjacentHTML("beforeend", `<p><strong>Overall Report result: <span class="badge ${getResultClass(report_check_result)}">${getResultText(report_check_result)}</span></strong></p>`);
    op_div.insertAdjacentHTML("beforeend", `<p>Execution status: <span class="badge ${getExecutionClass(report_execution_status)}">${report_execution_status}</span></p>`);
    op_div.insertAdjacentHTML("beforeend", `<p>${report_tool_info_button.outerHTML}</p>`);

    // QC inspector tab

    for (const item of xml_doc.querySelectorAll("Report>ItemResults>ItemResult")) {
    
        const item_id = safeText(item.querySelector("ItemResult>EBUQCID"));
        const item_name = safeText(item.querySelector("ItemResult>EBUQCName"));
        const item_version = safeText(item.querySelector("ItemResult>EBUQCVersion"));

        const item_result_card_clone = template_item_result_card.content.cloneNode(true).querySelector("div.card");
        qc_div.append(item_result_card_clone);
        const item_img_div = item_result_card_clone.querySelector("div[class^='col-']:nth-child(1)")
        const item_info_div = item_result_card_clone.querySelector("div[class^='col-']:nth-child(2)")

        let item_tool_information = item.querySelector("ItemResult>ToolInformation");
        if (item_tool_information === null){
            // Inherit tool information from the Report
            item_tool_information = xml_doc.querySelector("Report>ToolInformation");
        }
        const item_tool_info_button = template_item_tool_info_button.content.cloneNode(true).querySelector("button");
        item_tool_info_button.setAttribute("data-bs-a", safeText(item_tool_information.querySelector("ToolID")));
        item_tool_info_button.setAttribute("data-bs-b", safeText(item_tool_information.querySelector("ToolName")));
        item_tool_info_button.setAttribute("data-bs-c", safeText(item_tool_information.querySelector("Vendor")));
        item_tool_info_button.setAttribute("data-bs-d", safeText(item_tool_information.querySelector("URL")));
        item_tool_info_button.setAttribute("data-bs-e", safeText(item_tool_information.querySelector("Version")));
    
        const item_result = xmlToBoolean(item.querySelector("ItemResult>CheckResult"));
        const item_execution_status = safeText(item.querySelector("ItemResult>ExecutionStatus", "error"));

        item_info_div.insertAdjacentHTML("beforeend", `<h2>${item_name} (${item_id}, v${item_version})</h2>`);
        item_info_div.insertAdjacentHTML("beforeend", `<p><strong>Item result: <span class="badge ${getResultClass(item_result)}">${getResultText(item_result)}</span></strong></p>`);
        item_info_div.insertAdjacentHTML("beforeend", `<p>Execution status: <span class="badge ${getExecutionClass(item_execution_status)}">${item_execution_status}</span></p>`);        
        item_info_div.insertAdjacentHTML("beforeend", `<p>${item_tool_info_button.outerHTML}</p>`);

        const outputs_with_time_locators = item.querySelectorAll("ItemResult>Outputs>Output:has(>Locator>:is(Start, End))");
        if (outputs_with_time_locators.length > 0){
            const dropdown_clone = template_dropdown.content.cloneNode(true);
            for (const output of outputs_with_time_locators) {
                dropdown_clone.querySelector("ul").insertAdjacentHTML("beforeend", `<li><a class="dropdown-item" href="#">${safeText(output.querySelector("Output>Name"))}: ${safeText(output.querySelector("Output>Locator>Start"))}-${safeText(output.querySelector("Output>Locator>End"))}</a></li>`);
            }
            item_info_div.append(dropdown_clone);
        }
        
        // Fetch from the Catalogue API
        const item_def_api_url = `${catalogue_api_prefix}/items/${item_id}/versions/${item_version}`;
        fetch(item_def_api_url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Error when fetching ${item_def_api_url} with HTTP error: ${response.status}`);
            }
            return response.text();
        })
        .then((text) => {
            
            // Parse Catalogue XML response
            const item_def_xml_doc = parser.parseFromString(text, "text/xml");

            // Use smallest available "full" image
            const image_sizes = [];
            item_def_xml_doc.querySelectorAll("ItemInfo>Card>FullImage>Source>Width").forEach((x,y,z) => image_sizes.push(parseInt(x.textContent)));
            const item_def_image_url=safeText(item_def_xml_doc.querySelectorAll("ItemInfo>Card>FullImage>Source>Location")[image_sizes.indexOf(Math.min(...image_sizes))]);
            item_img_div.insertAdjacentHTML("beforeend", `<img src="${item_def_image_url}" class="img-fluid mx-auto d-block">`);

            // Check EBUQCName value matches with Catalogue
            if (item_name !== null){
                const item_def_name = safeText(item_def_xml_doc.querySelector("ItemInfo>Item>EBUQCName"));
                if (item_name != item_def_name)
                    {validationMessage("ItemResult EBUQCName mismatch with Catalogue API", `"${item_name}" vs "${item_def_name}"`, "danger");}
            }

            // Add log message
            validationMessage("Item Definition fetched from Catalogue API and processed successfully", `${item_def_api_url}`, "success");

        })
        .catch((error) => {
            validationMessage("Item Definition could not be fetched from Catalogue API and/or parsing or processing error", `${item_def_api_url}<br/>${error}`, "danger");
        });

    }
    
    // Engineer tab
    document.querySelector("#eng-text").value = normalized;
    
    // Show report details
    results_div.classList.remove("d-none");

}

window.addEventListener("error", e => {
    window.alert("Unknown error. Make sure that the XML document has all the XML elements required by the latest design.");
});

window.addEventListener("unhandledrejection", e => {
    window.alert("Unknown error. Make sure that the XML document has all the XML elements required by the latest design.");
  })

fetch("../../qc-data-model/qc.xsd")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    return response.text();
  })
  .then((text) => {
    xsd_text = text;
    const xsd_doc = parser.parseFromString(xsd_text, "text/xml");
    const xsd_doc_targetNamespace = xsd_doc.documentElement.getAttribute("targetNamespace");
    
    document.querySelector("#support-xml").insertAdjacentHTML("beforeend", xsd_doc_targetNamespace);
    document.querySelector("#support-api").insertAdjacentHTML("beforeend", catalogue_api_prefix);

    const ToolInformationModal = document.querySelector("#ToolInformationModal");
    ToolInformationModal.addEventListener("show.bs.modal", event => {
        const button = event.relatedTarget;  // Button that triggered the modal
        ToolInformationModal.querySelector("#TIM-a").value = button.getAttribute("data-bs-a");
        ToolInformationModal.querySelector("#TIM-b").value = button.getAttribute("data-bs-b");
        ToolInformationModal.querySelector("#TIM-c").value = button.getAttribute("data-bs-c");
        ToolInformationModal.querySelector("#TIM-d").value = button.getAttribute("data-bs-d");
        ToolInformationModal.querySelector("#TIM-e").value = button.getAttribute("data-bs-e");
    });

    document.querySelector("#open_report_button").onclick = processDoc;
    document.querySelector("#open_report_button").removeAttribute("disabled");
  })
  .catch((error) => {
    document.querySelector("#open_report_button").insertAdjacentHTML("afterend", `<div class="alert alert-danger" role="alert">Fatal error. Unable to load and/or parse Schema (XSD) for QC Reports. ${error}</div>`);
  });
