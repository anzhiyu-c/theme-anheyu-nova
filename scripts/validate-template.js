#!/usr/bin/env node

/**
 * 模板验证脚本
 * 检查 Go 模板是否有效，验证必要的变量和结构
 */

const fs = require("fs");
const path = require("path");

const templatesDir = path.join(__dirname, "..", "templates");

// Go 模板变量检查模式
const REQUIRED_VARIABLES = {
  "index.html": [
    ".siteConfig.SiteName",
    ".siteConfig.Description",
    ".siteConfig.Author",
    ".featuredArticles",
    ".recentArticles",
    "json .initialData",
    "json .siteConfig",
  ],
  "posts.html": [
    ".siteConfig.SiteName",
    ".articles",
    ".pagination",
    "json .initialData",
    "json .siteConfig",
  ],
  "posts/__template__.html": [
    ".article.Title",
    ".article.Slug",
    ".article.Excerpt",
    ".article.ContentHTML",
    ".article.Category",
    ".article.Tags",
    ".siteConfig.SiteName",
    "json .initialData",
    "json .siteConfig",
  ],
};

// 必须的模板定义
const REQUIRED_DEFINES = ["header", "footer", "article-card", "pagination"];

// 检查颜色
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";

function checkTemplate(templatePath, requiredVars) {
  const fullPath = path.join(templatesDir, templatePath);
  const errors = [];
  const warnings = [];

  if (!fs.existsSync(fullPath)) {
    return { errors: [`模板文件不存在: ${templatePath}`], warnings: [] };
  }

  const content = fs.readFileSync(fullPath, "utf-8");

  // 检查必需变量
  for (const variable of requiredVars) {
    if (!content.includes(variable) && !content.includes(variable.replace(/\./g, " ."))) {
      errors.push(`缺少必需变量: ${variable}`);
    }
  }

  // 检查 HTML 结构
  if (!content.includes("<!DOCTYPE html>") && !content.includes('{{define "')) {
    warnings.push("模板可能缺少 DOCTYPE 或 define 声明");
  }

  // 检查 __INITIAL_DATA__ 注入
  if (!content.includes("__INITIAL_DATA__")) {
    warnings.push("模板可能缺少 __INITIAL_DATA__ 注入");
  }

  // 检查 CSS/JS 占位符
  if (!content.includes("CSS_PLACEHOLDER") && !content.includes("rel=\"stylesheet\"")) {
    warnings.push("模板可能缺少 CSS 引用");
  }

  return { errors, warnings };
}

function checkComponentTemplates() {
  const componentsDir = path.join(templatesDir, "components");
  const errors = [];

  for (const define of REQUIRED_DEFINES) {
    const found = fs.readdirSync(componentsDir).some((file) => {
      const content = fs.readFileSync(path.join(componentsDir, file), "utf-8");
      return content.includes(`{{define "${define}"}}`);
    });

    if (!found) {
      errors.push(`缺少组件定义: {{define "${define}"}}`);
    }
  }

  return errors;
}

function main() {
  console.log("\n📋 Go 模板验证工具\n");

  let hasErrors = false;
  let totalErrors = 0;
  let totalWarnings = 0;

  // 检查主模板
  for (const [template, vars] of Object.entries(REQUIRED_VARIABLES)) {
    console.log(`检查 ${template}...`);
    const { errors, warnings } = checkTemplate(template, vars);

    if (errors.length > 0) {
      hasErrors = true;
      totalErrors += errors.length;
      errors.forEach((e) => console.log(`  ${RED}✗${RESET} ${e}`));
    }

    if (warnings.length > 0) {
      totalWarnings += warnings.length;
      warnings.forEach((w) => console.log(`  ${YELLOW}⚠${RESET} ${w}`));
    }

    if (errors.length === 0 && warnings.length === 0) {
      console.log(`  ${GREEN}✓${RESET} 验证通过`);
    }
  }

  // 检查组件模板
  console.log("\n检查组件模板...");
  const componentErrors = checkComponentTemplates();
  if (componentErrors.length > 0) {
    hasErrors = true;
    totalErrors += componentErrors.length;
    componentErrors.forEach((e) => console.log(`  ${RED}✗${RESET} ${e}`));
  } else {
    console.log(`  ${GREEN}✓${RESET} 所有组件定义存在`);
  }

  // 总结
  console.log("\n" + "─".repeat(40));
  if (hasErrors) {
    console.log(`${RED}验证失败${RESET}: ${totalErrors} 个错误, ${totalWarnings} 个警告`);
    process.exit(1);
  } else if (totalWarnings > 0) {
    console.log(`${YELLOW}验证通过${RESET}: ${totalWarnings} 个警告`);
  } else {
    console.log(`${GREEN}验证通过${RESET}: 所有模板正常`);
  }
}

main();
