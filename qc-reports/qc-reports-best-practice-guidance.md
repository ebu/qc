# EBU QC: QC Reports: Best practice guidance for a pass/fail media content QC operation

## About

This document defines a set of provisions to aid interoperability of EBU QC Reports as XML files.

It assumes that QC of a media file or package is performed to generate a QC Report that has an overall result (either "pass" or "fail").

Example scenario: a broadcaster requires that every media file received is accompanied by a QC Report that:

* confirms that the broadcaster-mandated QC tests have all been performed
* gives an overall result of "pass" or "fail"

In general, EBU QC Reports are not required to comply with the provisions in this document. Indeed, the provisions might not be applicable to QC Reports created in other scenarios.

*ℹ️ In this document names of entities from the XML Schema are used. These differ slightly from the Class names used in the documentation of the Model e.g. a QCItemDefinition instance in an EBU QC Report XML file is represented by an `ItemDefinition` XML element*

## `/Report`

* `/Report/CheckResult` shall be present
* `/Report/ContentId` shall identify the specific media file or package that was tested
* `/Report/ToolInformation` shall be present
  * This shall communicate the software tool used to generate the QC Report XML document (that is, the final assembling and writing out of the XML document; some of the information inside the Report might have been produced by other software tools).

## `/Report/Profile`

* `/Report/Profile` shall be populated to describe the tests carried out to generate this Report
* `/Report/Profile/ContentId` shall be identical to `/Report/ContentId`
* If any `EBUQCID` value is used by more than one child of `/Report/Profile/Items` then those children shall all have the same `EBUQCVersion` value
* At least one child of `/Report/Profile/Items` shall be a "check" item
* `/Report/Profile/ItemDefinitions` shall contain zero children

## `/Report/ItemResults`

* The children of `/Report/ItemResults` shall map 1-to-1 to the children of `/Report/Profile/Items` when matched using a combination of `EBUQCID` and `InstanceId`
  * `InstanceId` only needs to be present in cases where an `EBUQCID` value is used by more than one child of `/Report/Profile/Items`
* Any number of `ItemResult`s may contain `ToolInformation` (none of them, all of them, or some of them)
  * Any `ItemResult` without `ToolInformation` shall inherit the information from the `Report`
  * Note: All `Output`s and `Group`s that belong to an `ItemResult` are necessarily associated with the same `ToolInformation` as the `ItemResult`
* `/Report/ItemResults/ItemResult/Revision` shall not be present for any `ItemResult`

## Time values in `LocatorType` instances (`Start` and `End` values)

These `Start` and `End` values are purely freeform strings. There is currently nothing inside a QC Report that tells the reader how to interpret these strings. So, current best practice is for each QC Report creator to externally document/communicate how these strings are populated.

## Timezones

* All values of type `xs:dateTime` shall specify a timezone. Examples:
  * `2002-05-30T09:30:10Z`
  * `2002-05-30T09:30:10+06:00`

## Checklist for verifying compliance of QC Report XML files

A non-exhaustive checklist to ensure that Reports are conformant:
* XML Schema compliance
* Compliance with the documentation of the Model
* Valid values are used for all the "enumeration" types where the list of allowed values is managed externally to the XML Schema
* (optional) Compliance with this Best Practice Guidance
* The children of `/Report/Profile/Items` and `/Report/ItemResults` comply with the corresponding QCItemDefinition instances in the EBU-hosted catalogue
* Each child of `/Report/ItemResults` complies with the constraints of the corresponding child of `/Report/Profile/Items`
  * For example, if an `Item` has a value of "check" for `UsedAs` then its corresponding `ItemResult` must have a `CheckResult` element
* `/Report/ExecutionStatus` has the correct value when considering `/Report/ItemResults/ItemResult/ExecutionStatus` for all `ItemResult`s
* `/Report/CheckResult` has the correct value when considering `/Report/ItemResults/ItemResult/CheckResult` for all `ItemResult`s

