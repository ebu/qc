# EBU QC: Data model

## About

The XML Schema and Class model for EBU QC Reports, QC Profiles and QC Item Definitions

## Main files

* **XML Schema** for EBU QC Reports, Profiles and Item Definitions: [qc.xsd](qc.xsd)
* **Documentation** of the Class model and how this relates to the Schema: [pdf](qc-data-model.pdf) (*auto-generated*) | [docx](qc-data-model.docx) (*original*)

## Approach to versioning of qc.xsd

* This project aims to avoid changing qc.xsd unless absolutely necessary
* Use of the built-in extension mechanism is preferred over changing qc.xsd
* If qc.xsd is ever changed then the XML namespace will be changed
* The accompanying documentation, best practice guidance, etc are likely to change even if qc.xsd does not. Additionally, sets of use case specific constraints might be defined. The intention is to provide a mechanism to signal which of these resources/constraints (and which version) is being followed. This mechanism could be used in an XML document conforming to qc.xsd and would be separate to the XML namespace.
