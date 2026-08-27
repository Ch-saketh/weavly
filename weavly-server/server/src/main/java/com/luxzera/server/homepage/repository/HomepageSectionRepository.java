package com.luxzera.server.homepage.repository;

import com.luxzera.server.homepage.entity.HomepageSection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface HomepageSectionRepository extends JpaRepository<HomepageSection, UUID> {
    List<HomepageSection> findByActiveTrueOrderByDisplayOrderAsc();
}
