import * as xmllint from "./node_modules/xmllint-wasm/index-browser.mjs";

let xsd_text = "";

async function validateXMLDoc(xml, schema) {
    try{
        const { valid, rawOutput, normalized } =
        await xmllint.validateXML(
            {
                xml: { fileName: "qc_report_xml_file", contents: xml },
                schema: schema,
                normalization: 'format'
            });
        return { valid, rawOutput, normalized };

    } catch(error){
        return { valid: false, rawOutput: error.message, normalized:''};
    }
	
}

async function getFileXMLDoc() {
    const [fileHandle] = await window.showOpenFilePicker();
    const file = await fileHandle.getFile();
    const xml_doc_text = await file.text();
    
    return xml_doc_text;
}

function getResultClass(text) {
    let result_class = "";
    if (text=="true")
        {result_class="text-bg-success";}
    else if(text=="N/A")
        {result_class="text-bg-warning";}
    else
        {result_class="text-bg-danger";}
    return result_class;
}

function getResultFormatted(text) {
    if (text=="true")
        return "✔Pass";
    else
        return "❌Fail";
}

function safeText(selector_result){
    if (selector_result===null)
        return "";
    else {
        return selector_result.textContent;
    }
}

async function processDoc() {

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

    const validation_output_div = document.querySelector("#validation-output"); 

    if (!valid){
        validation_output_div.innerHTML = `<strong> XSD Validation failed</strong> <br/> Raw Output: ${rawOutput}`;
        validation_output_div.classList.remove("d-none");
        validation_output_div.classList.remove("alert-info");
        validation_output_div.classList.remove("alert-success");
        validation_output_div.classList.add("alert-danger");
        results_div.replaceChildren(`XSD VALIDATION FAILED`);
        results_div.classList.add("d-none");
        return false;
    } 

    validation_output_div.innerHTML = `<strong> XSD Validation successful</strong> <br/> Raw Output: ${rawOutput}`;
    validation_output_div.classList.remove("d-none");
    validation_output_div.classList.remove("alert-info");
    validation_output_div.classList.remove("alert-danger");
    validation_output_div.classList.add("alert-success");

    const parser = new DOMParser();
    const xml_doc = parser.parseFromString(xml_doc_text, "text/xml");


    // Extract report details and add to HTML
    const template_results_nav = document.querySelector("#template-results-nav"); 
    results_div.replaceChildren(template_results_nav.content.cloneNode(true));

    const op_div = document.querySelector("#nav-1");
    const qc_div = document.querySelector("#nav-2");
    const eng_div = document.querySelector("#nav-3");

    const template_report_tool_info_button = document.querySelector("#template-report-tool-info-button");
    const template_item_tool_info_button = document.querySelector("#template-item-tool-info-button");
    let report_tool_info_button = template_report_tool_info_button.content.cloneNode(true).querySelector("button");
    report_tool_info_button.setAttribute("data-bs-a", safeText(xml_doc.querySelector("Report>ToolInformation>ToolID")));
    report_tool_info_button.setAttribute("data-bs-b", safeText(xml_doc.querySelector("Report>ToolInformation>ToolName")));
    report_tool_info_button.setAttribute("data-bs-c", safeText(xml_doc.querySelector("Report>ToolInformation>Vendor")));
    report_tool_info_button.setAttribute("data-bs-d", safeText(xml_doc.querySelector("Report>ToolInformation>URL")));
    report_tool_info_button.setAttribute("data-bs-e", safeText(xml_doc.querySelector("Report>ToolInformation>Version")));

    let report_check_result = "N/A";
    if (xml_doc.querySelector("Report>CheckResult") !== null){
        report_check_result = xml_doc.querySelector("Report>CheckResult").textContent;
    }

    if (xml_doc.querySelector("Report>ModifiedCheckResult") === null){
        op_div.insertAdjacentHTML("beforeend", `<p>Overall result: <span class="badge ${getResultClass(report_check_result)}">${report_check_result}</span></p><p>${report_tool_info_button.outerHTML}</p>`);
    } else {
        const report_modified_check_result = xml_doc.querySelector("Report>ModifiedCheckResult>OverrideValue").textContent;
        op_div.insertAdjacentHTML("beforeend", `<p>Overall result: <span class="badge ${getResultClass(report_modified_check_result)}">${report_modified_check_result}</span> <em>(result was "${report_check_result}" before override)</em></p><p>${report_tool_info_button.outerHTML}</p>`);
    }
   

    const template_dropdown = document.querySelector("#template-dropdown"); 

    for (const item of xml_doc.querySelectorAll("Report>ItemResults>ItemResult")) {
        
        qc_div.insertAdjacentHTML("beforeend", `<h2>${safeText(item.querySelector("ItemResult>EBUQCName"))} (${safeText(item.querySelector("ItemResult>EBUQCID"))})</h2>`);
        
        let item_tool_information = item.querySelector("ItemResult>ToolInformation");
        if (item_tool_information === null){
            // Inherit tool information from the Report
            item_tool_information = xml_doc.querySelector("Report>ToolInformation");
        }

        let item_tool_info_button = template_item_tool_info_button.content.cloneNode(true).querySelector("button");
        item_tool_info_button.setAttribute("data-bs-a", safeText(item_tool_information.querySelector("ToolID")));
        item_tool_info_button.setAttribute("data-bs-b", safeText(item_tool_information.querySelector("ToolName")));
        item_tool_info_button.setAttribute("data-bs-c", safeText(item_tool_information.querySelector("Vendor")));
        item_tool_info_button.setAttribute("data-bs-d", safeText(item_tool_information.querySelector("URL")));
        item_tool_info_button.setAttribute("data-bs-e", safeText(item_tool_information.querySelector("Version")));
    
        let item_result = "N/A";
        if(item.querySelector("ItemResult>CheckResult") !== null){
            item_result = item.querySelector("ItemResult>CheckResult").textContent;
        }
    
        if (item.querySelector("ItemResult>ModifiedCheckResult") === null){
            qc_div.insertAdjacentHTML("beforeend", `<p>Item result: <span class="badge ${getResultClass(item_result)}">${item_result}</span></p><p>${item_tool_info_button.outerHTML}</p>`);
        } else {
            const item_modified_check_result = item.querySelector("ItemResult>ModifiedCheckResult>OverrideValue").textContent;
            qc_div.insertAdjacentHTML("beforeend", `<p>Item result: <span class="badge ${getResultClass(item_modified_check_result)}">${item_modified_check_result}</span> <em>(result was "${item_result}" before override)</em></p><p>${item_tool_info_button.outerHTML}</p>`);
        }
        
        if (item.querySelectorAll("ItemResult>Outputs>Output").length > 0){

            let dropdown_clone = template_dropdown.content.cloneNode(true);

            for (const output of item.querySelectorAll("ItemResult>Outputs>Output")) {

                let suffix_text = "";
                if(output.querySelector("Output>CheckResult") !== null) {
                    const output_result = output.querySelector("Output>CheckResult").textContent;
                    
                    if (output.querySelector("Output>ModifiedCheckResult") === null){
                        suffix_text += getResultFormatted(output_result);
                    } else {
                        const output_modified_check_result = output.querySelector("Output>ModifiedCheckResult>OverrideValue").textContent;
                        suffix_text += getResultFormatted(output_modified_check_result) + ` (result was "${item_result}" before override)`;
                    }
        
                    if (output.querySelector("Output>ExtendedAnnotations>ExtendedAnnotation") !== null){
                        suffix_text += ' 💬'
                    }

                }
                                
                dropdown_clone.querySelector("ul").insertAdjacentHTML("beforeend", `<li><a class="dropdown-item" href="#">${output.querySelector("Output>Locator>Start").textContent} ${suffix_text}</a></li>`);

            }

            qc_div.append(dropdown_clone);
        }

    }
    
    eng_div.insertAdjacentHTML("beforeend", `<textarea rows="30" id="eng-text" class="form-control" readonly></textarea>`);
    document.querySelector("#eng-text").value = xml_doc_text;
    
    results_div.classList.remove("d-none");

}


window.addEventListener('error', e => {
    window.alert("Unknown error. Make sure that the XML document has all the XML elements required by the latest design.");
});

window.addEventListener('unhandledrejection', e => {
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

    const ToolInformationModal = document.getElementById('ToolInformationModal');
    ToolInformationModal.addEventListener('show.bs.modal', event => {
        // Button that triggered the modal
        const button = event.relatedTarget;

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
    document.querySelector("#open_report_button").insertAdjacentHTML("afterend", `<div class="alert alert-danger" role="alert">Fatal error. Unable to load Schema (XSD) for QC reports. ${error}</div>`);
  });
