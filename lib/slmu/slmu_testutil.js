/*
 * Copyright (c) 2016, Two Sigma Open Source
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice,
 *   this list of conditions and the following disclaimer.
 *
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * * Neither the name of slim nor the names of its
 *   contributors may be used to endorse or promote products derived from
 *   this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */
"use strict";

/**
 * This module contains methods used in testing other slim components.
 */

const co      = require("co");
const fs      = require("fs-promise");
const path    = require("path");
const NodeGit = require("nodegit");
const rimraf  = require("rimraf");
const temp    = require("temp");

/**
 * Return the path to a newly-created temporary directory.
 *
 * @async
 * @private
 * @return {String}
 */
function makeTempDir() {
    return new Promise(function (fullfill, reject) {
        temp.mkdir("slim-test", function (err, path) {
            if (err) {
                reject(err);
            }
            else {
                fullfill(path);
            }
        });
    });
}

/**
 * Return a non-bare repository hosted in a temporary directory in the
 * following state:
 * - not-bare
 * - contains at least one commit
 * - contains the file "README.md"
 * - on branch 'master'
 * - working directory and index are clean
 *
 * @async
 * @return {NodeGit.Repository}
 */
exports.createSimpleRepository = co.wrap(function *() {
    const repoPath = yield makeTempDir();
    const repo = yield NodeGit.Repository.init(repoPath, 0);
    const fileName = "README.md";
    const filePath = path.join(repoPath, "README.md");
    yield fs.writeFile(filePath, "");
    const sig = repo.defaultSignature();
    yield repo.createCommitOnHead([fileName], sig, sig, "first commit");
    return repo;
});

/**
 * Remove the files backing the specified `repo`.
 *
 * @async
 * @param {NodeGit.Repository} repo
 */
exports.removeRepository = function (repo) {
    return new Promise(callback => {
        return rimraf(repo.workdir(), {}, callback);
    });
};