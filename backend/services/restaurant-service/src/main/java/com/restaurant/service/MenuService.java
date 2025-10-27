package com.restaurant.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;

import com.restaurant.repository.MenuRepository;
import com.restaurant.model.MenuItems;
import com.restaurant.service.RestaurantService;

import java.util.List;


@Service
public class MenuService {

    @Autowired
    MenuRepository menuRepo;
    
    @Autowired
    RestaurantService restaurantService;

    public List<MenuItems> getAllMenuItemsByRestaurantName(String name){
        // Find restaurant by name to get its ID
        Long restaurantId = restaurantService.getRestaurantByName(name).getId();
        // Get menu items for this restaurant
        return menuRepo.findByRestaurantId(restaurantId);
    }

    public List<MenuItems> getAllMenuItemsByRestaurantId(Long restaurantId){
        // Get menu items for this restaurant ID directly
        return menuRepo.findByRestaurantId(restaurantId);
    }

    public MenuItems getMenuItemById(String id){
        return menuRepo.findById(id).orElseThrow(()-> new EntityNotFoundException(
            "Menu not found with id:" + id
        ));
    }

    
    public MenuItems createMenuItem(MenuItems menuItem){
        // Minimal validation: cancel if name already exists
        if (menuRepo.existsByName(menuItem.getName())) {
            throw new RuntimeException("Menu item name already exists: " + menuItem.getName());
        }
        
        // Generate ID based on category: A=entree, B=main, C=dessert, D=drink
        String categoryPrefix;
        switch(menuItem.getCategory().toLowerCase()) {
            case "entree": categoryPrefix = "A"; break;
            case "main": categoryPrefix = "B"; break;
            case "dessert": categoryPrefix = "C"; break;
            case "drink": categoryPrefix = "D"; break;
            default: categoryPrefix = "X"; break; // fallback for unknown categories
        }
        
        // Find next available number for this category
        List<MenuItems> existingItems = menuRepo.findAll();
        int nextNumber = existingItems.stream()
            .filter(item -> item.getId() != null && item.getId().startsWith(categoryPrefix))
            .mapToInt(item -> {
                try {
                    return Integer.parseInt(item.getId().substring(1));
                } catch (NumberFormatException e) {
                    return 0;
                }
            })
            .max()
            .orElse(0) + 1;
        
        // Format ID as A001, B001, etc.
        String newId = categoryPrefix + String.format("%03d", nextNumber);
        
        // Minimal validation: cancel if ID already exists
        if (menuRepo.existsById(newId)) {
            throw new RuntimeException("Menu item ID already exists: " + newId);
        }
        
        menuItem.setId(newId);
        return menuRepo.save(menuItem);
    }

    public MenuItems updateMenuItem(String id, MenuItems newItem){
        // Fetch existing menu item using getMenuItemById(id)
        MenuItems item = getMenuItemById(id);
        
        // For each cols, check if null 
        if(newItem.getName() !=null) item.setName(newItem.getName());
        if(newItem.getDescription() !=null) item.setDescription(newItem.getDescription());
        if(newItem.getPrice() !=null) item.setPrice((newItem.getPrice()));
        if(newItem.getCategory() !=null) item.setCategory(newItem.getCategory());
        if(newItem.getRestaurantId() !=null) item.setRestaurantId(newItem.getRestaurantId());
        // boolean not nullable
        item.setAvailable((newItem.getAvailable()));

        // Save and return the merged object
        return menuRepo.save(item);
    }

    public void deleteMenuItem(String id){
        // Verify item exists before deleting
        getMenuItemById(id);
        menuRepo.deleteById(id);
    }
}
