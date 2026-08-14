// Language-aware replacements for Next's Link, useRouter and usePathname.
// Always import these instead of the ones from "next/link" and "next/navigation",
// otherwise links drop the /sv or /en prefix.

import { createNavigation } from "next-intl/navigation"

import { routing } from "./routing"

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
