# EBU QC: QC Reports: Compliance checklist

## Overview

A non-exhaustive checklist to ensure that EBU QC Report XML files are compliant. This checklist applies to all EBU QC Report XML files.

*ℹ️ In this document, names of entities from the XML Schema are used when referring to entities inside the Report XML file. These differ slightly from the Class names used in the documentation of the Model e.g. a "QCItemDefinition" instance in an EBU QC Report XML file is represented by an `ItemDefinition` XML element*

## EBU QC Report XML file checklist (non-exhaustive)

### Main checks

* XML Schema compliance
* Compliance with the documentation of the EBU QC Data Model (see below)
* *(optional)* Compliance with a Best Practice Guidance document (such as [the guidance document for Scenario 1](qc-reports-best-practice-guidance-1.md))

### Examples of checks for compliance with the documentation of the EBU QC Data Model

* Valid values are used for all the "enumeration" types (the list of allowed values is managed externally to the XML Schema for some "enumeration" types)
* `/Report/Profile` is populated to fully define the associated Profile, including all the `Item`s (these describe the tests carried out to generate the Report)
* `/Report/ContentId` is identical to `/Report/Profile/ContentId`
* `/Report/ExecutionStatus` is:
  * `complete` if `/Report/ItemResults/ItemResult/ExecutionStatus` is `complete` for all `ItemResult`s
  * `error` otherwise
* The children of `/Report/ItemResults` shall map 1-to-1 to the children of `/Report/Profile/Items` when matched using a combination of `EBUQCID` and `InstanceId`
  * The matched children (the `ItemResult` and the `Item`) shall both have the same `EBUQCName` value and `EBUQCVersion` value
  * Note: `InstanceId` only needs to be present in cases where an `EBUQCID` value is used by more than one child of `/Report/Profile/Items`
* Each child of `/Report/ItemResults` and of `/Report/Profile/Items` complies with the corresponding QCItemDefinition instance (identified by a combination of `EBUQCID` and `EBUQCVersion`) in the EBU-hosted catalogue. For example:
  * `EBUQCName` is the same as QCItemDefinition/EBUQCName
  * If QCItemDefinition/UsableAs:
    * has two values: then `UsedAs` must be present on the corresponding `Item` and contain one of the two values.
    * has one value: then `UsedAs` may be present or absent on the corresponding `Item`. If present, then `UsedAs` and UsableAs must have the same value.
* Any `Input`s (children or grandchildren of `Item/Inputs`) and any `Output`s (children or grandchildren of `ItemResult/Outputs`) comply with Annex C of the [QC Data Model document](../qc-data-model/)
* Each `Output/Severity` value is less than or equal to the corresponding `ItemResult/MaxSeverity` value (if present)
* If `TimingExtensionMediaPlaybackEditUnits` is used, then it is used in accordance with Annex D of the [QC Data Model document](../qc-data-model/)
* `CheckResultRule`, `CheckResult`, `Relevance`, `RelevanceLevel` elements are used in accordance with Annex E of the [QC Data Model document](../qc-data-model/)
* `Scopes` elements are used in accordance with Annex F of the [QC Data Model document](../qc-data-model/)

