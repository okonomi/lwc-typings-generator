import IHelperTypesGenerator from "./IHelperTypesGenerator";
import { join } from "path";
import { promises } from "fs";
import { Connection } from "jsforce";
import { SfdxProject } from "@salesforce/core";

export default class SObjectHelperTypesGenerator
	implements IHelperTypesGenerator
{
	async generateForProject(
		project: SfdxProject,
		helperTypesRoot: string,
		connection: Connection
	): Promise<any> {
		const globalDescribe = await connection.describeGlobal();
		const fullPath = join(helperTypesRoot, "sobjects.d.ts");
		let sObjectsMapTypings =
			"declare namespace schema {\n\tdeclare interface SObjectsMap {\n ";

		const sObjectDescribes = globalDescribe.sobjects;
		const sObjectMapEntriesTypings = sObjectDescribes
			.map((sObjectDescribe) => {
				const apiName = sObjectDescribe.name;
				return `\t\t"${apiName}": schema.${apiName}`;
			})
			.join("\n");

		const apiNamesTypings =
			"\tdeclare type SObjectApiName = keyof schema.SObjectsMap\n";

		return promises.writeFile(
			fullPath,
			sObjectsMapTypings +
				sObjectMapEntriesTypings +
				"\n\t}\n" +
				apiNamesTypings +
				"}\n"
		);
	}
}