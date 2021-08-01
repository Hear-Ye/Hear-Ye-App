/*
 * Copyright (c) Hear Ye LLC and its affiliates
 *
 * This source code is licensed under the Apache 2.0 license found
 * in the LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import {useCallback, useEffect, useState} from 'react';

export function useFetch(initialPath, asyncFn) {
  const [page, setPage] = useState(initialPath);
  const [shouldFetch, setShouldFetch] = useState(true);
  const [topics, setTopics] = useState([]);
  const fetchMore = useCallback(() => setShouldFetch(true), []);

  useEffect(() => {
    // prevent fetching for other state changes
    if (!shouldFetch || !page) {
      return;
    }

    const fetch = async () => {
      const newData = await asyncFn(page);
      setShouldFetch(false);
      setTopics(oldData => [...oldData, ...newData.data]);
      setPage(newData.next);
    };

    fetch();
  }, [asyncFn, page, shouldFetch]);

  return [topics, fetchMore];
}
