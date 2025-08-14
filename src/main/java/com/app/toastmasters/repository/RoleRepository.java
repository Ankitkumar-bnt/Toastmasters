package com.app.toastmasters.repository;

import com.app.toastmasters.entity.Roles;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends JpaRepository<Roles, Integer> {
    Roles findByRoleName(String roleName);

    @Query("SELECT r.roleName FROM Roles r WHERE r.roleId = :roleId")
    String findRoleNameByRoleId(@Param("roleId") Integer roleId);

}
