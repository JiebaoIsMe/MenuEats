package com.restaurant.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.restaurant.model.MenuItems;

import java.util.List;

@Repository
public interface MenuRepository extends JpaRepository<MenuItems,String> {
    // Each restaurant have more than 1 menu items.

    // No need menu, just items, each items have code and category,
    // when displaying, group based on category
    // ( stored as list inside menu Repo)
    // <"main":{menu_items}>

    List<MenuItems> findByRestaurantId(Long restaurantId);
    List<MenuItems> findByRestaurantIdAndCategory(Long restaurantId, String category);
    List<MenuItems> findByRestaurantIdAndAvailable(Long restaurantId, boolean available);
    
    boolean existsByName(String name);
}


