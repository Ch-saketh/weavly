package com.luxzera.server.user.service;

import com.luxzera.server.user.dto.history.*;
import com.luxzera.server.user.entity.User;

import java.util.List;

public interface UserActivityHistoryService {

    SearchHistoryDto recordSearch(User user, RecordSearchRequest request);

    ClickHistoryDto recordClick(User user, RecordClickRequest request);

    BagHistoryDto recordBagActivity(User user, RecordBagRequest request);

    List<SearchHistoryDto> getUserSearchHistory(User user, int limit);

    List<ClickHistoryDto> getUserClickHistory(User user, int limit);

    List<BagHistoryDto> getUserBagHistory(User user, int limit);

    void clearSearchHistory(User user);
}
