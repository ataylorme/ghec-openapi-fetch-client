import { expect, test } from "vitest";
import client, { paginationMiddleware } from "./index.js";
import type { paths } from "./lib/ghec/api/types/v1.d.js";

type getRepoResponseType =
	paths["/repos/{owner}/{repo}"]["get"]["responses"]["200"]["content"]["application/json"];
type getOrgReposResponseType =
	paths["/orgs/{org}/repos"]["get"]["responses"]["200"]["content"]["application/json"];

test("Can get the public octocat/Hello-World repository", async () => {
	const owner = "octocat";
	const repo = "Hello-World";
	const { data: helloWorldRepo, error: errorResponse } = await client.GET(
		"/repos/{owner}/{repo}",
		{
			params: {
				path: { owner, repo },
			},
		},
	);
	expect(errorResponse).toBeUndefined();
	expect(helloWorldRepo).toBeDefined();
	expect(helloWorldRepo?.full_name).toBe(`${owner}/${repo}`);
	if (helloWorldRepo !== undefined) {
		expect(helloWorldRepo satisfies getRepoResponseType);
	}
});

test("Can get octokit repositories with pagination", async () => {
	const org = "octokit";

	// attach the paginaton middleware
	client.use(paginationMiddleware);

	// make an API call to a paginated endpoint
	const { data: reposResponse, error: errorResponse } = await client.GET(
		"/orgs/{org}/repos",
		{
			params: {
				path: { org },
				query: {
					per_page: 10,
				},
			},
		},
	);

	// (optional) eject the pagination middleware
	client.eject(paginationMiddleware);

	expect(errorResponse).toBeUndefined();
	expect(reposResponse).toBeDefined();
	expect(reposResponse?.length).toBeGreaterThanOrEqual(11);
	if (reposResponse !== undefined) {
		expect(reposResponse satisfies getOrgReposResponseType);
	}
});
