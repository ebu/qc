# EBU QC: QC Reports: Best practice guidance for Scenario 1 ("pass/fail QC Report for a broadcaster")

## Overview

This document defines a set of provisions to aid interoperability of EBU QC Reports as XML files in "Scenario 1" (see below). These provisions constrain the EBU QC Data Model to reduce complexity.

In general, EBU QC Reports are not required to comply with the provisions in this document. Indeed, the provisions might not be applicable to other scenarios.

*ℹ️ In this document, names of entities from the XML Schema are used when referring to entities inside the Report XML file. These differ slightly from the Class names used in the documentation of the Model e.g. a "QCItemDefinition" instance in an EBU QC Report XML file is represented by an `ItemDefinition` XML element*

## About Scenario 1

In this scenario, QC of a media file or package is performed to generate a QC Report that has an overall result (either "pass" or "fail").

Example: a broadcaster requires that every media file received from a production company is accompanied by a QC Report that serves to:

* confirm that the broadcaster-mandated QC tests have all been performed
* provide an overall result of "pass" or "fail"

## Provisions

### `/Report`

* `/Report/CheckResult` shall be present
* `/Report/ToolInformation` shall be present
  * This shall communicate the software tool used to generate the QC Report XML document (that is, the final assembling and writing out of the XML document; some of the information inside the Report might have been produced by other software tools).
* `/Report/ExtensionProperties/TimingExtensionMediaPlaybackEditUnits` shall be present and the provisions of Annex D of the [QC Data Model document](../qc-data-model/) shall be complied with
  * Note: These provisions constrain how any `Start` and `End` elements in the XML file are used

### `/Report/Profile`

* `/Report/Profile/ItemDefinitions` shall contain zero children

### `/Report/Profile/Items`

* Each `Item` shall have:
  * `EBUQCName` present and populated
  * `UsedAs` present and populated
* At least one `Item` shall have a `UsedAs` value of `check`
* If any `EBUQCID` value is used by more than one `Item`, then all of these `Item`s shall have the same `EBUQCVersion` value

### `/Report/ItemResults`

* Each `ItemResult` shall have:
  * `EBUQCName` present and populated
  * `Revision` omitted
  * `ToolInformation` present and populated to identify the tool used to execute the associated `Item` (that is, the tool that actually carried out the QC test) unless this is accurately identified by `/Report/ToolInformation` in which case `ToolInformation` may be omitted from the `ItemResult`

### Timezones

* All values of type `xs:dateTime` shall specify a timezone. Examples:
  * `2002-05-30T09:30:10Z`
  * `2002-05-30T09:30:10+06:00`

