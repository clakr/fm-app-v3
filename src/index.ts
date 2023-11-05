#!/usr/bin/env bun
import { program } from "commander";
import { promisify } from "node:util";
import { exec } from "child_process";
import { appendFile } from "node:fs";
import { mkdir, rm } from "node:fs/promises";

const promisifiedExec = promisify(exec);

const FM_APP_PROJECT_PATH = "/Users/adsi2227/Desktop/projects/fm-app/";

try {
  program
    .argument("<Project Name>", "Name of the Frontend Mentor challenge")
    .argument("<Project Link>", "URL hub of the Frontend Mentor challenge")
    .option("-s, --structure [type]", "scaffolds the application", "html")
    .option(
      "-c, --css [framework]",
      "adds required packages and file required by the specified framework",
      "vanilla"
    )
    .action(async (projectName, projectLink, { structure, css }) => {
      /**
       * vite
       * - [x] create project
       */
      await promisifiedExec(
        `bun create vite ${projectName} --template vanilla-ts`
      );

      /**
       * git
       * - [x] initialize git
       * - [x] change git config
       */
      await promisifiedExec(`cd ${projectName} && git init`);

      const userCredentials =
        "[user]\n\tname=clakr\n\temail=clarktolosa@gmail.com";
      appendFile(`${projectName}/.git/config`, userCredentials, throwError);

      /**
       * install packages
       * - [x] postcss
       * - [x] autoprefixer
       */
      await promisifiedExec(
        `cd ${projectName} && bun add -D postcss autoprefixer`
      );

      /**
       * root files
       * - [x] .env
       * - [x] postcss.config.js
       * - [x] index.html
       */
      const envContents = `VITE_PROJECT_NAME="${transformSlugToSentenceCase(
        projectName
      )}"\nVITE_PROJECT_LINK="${projectLink}"\nVITE_PROJECT_REPOSITORY="https://github.com/clakr/${projectName}"`;
      Bun.write(`${projectName}/.env`, envContents);

      copyFile(projectName, "postcss.config.js");
      copyFile(projectName, "index.html");

      /**
       * src files
       */
      await rm(`${projectName}/src`, {
        recursive: true,
        force: true,
      });
      await mkdir(`${projectName}/src`);

      copyFile(projectName, "_authorModal.css", false);
      copyFile(projectName, "_authorModal.ts", false);
      copyFile(projectName, "_preflight.css", false);
      copyFile(projectName, "_vite-env.d.ts", false);
      copyFile(projectName, "main.ts", false);
      copyFile(projectName, "style.css", false);
    });

  program.parse();
} catch (error) {
  console.error(error);
}

function throwError(error: ErrnoException | null): void {
  if (!error) return;

  throw error;
}

function transformSlugToSentenceCase(input: string): string {
  return input
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function copyFile(projectName: string, fileName: string, root = true) {
  const toPath = root
    ? `${projectName}/${fileName}`
    : `${projectName}/src/${fileName}`;

  const fromPath = `${FM_APP_PROJECT_PATH}/files/${fileName}`;

  Bun.write(toPath, Bun.file(fromPath));
}
