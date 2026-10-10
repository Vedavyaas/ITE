package com.ieee.ite;

import com.ieee.ite.config.DataSeeder;
import com.ieee.ite.document.UserDocumentRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
class IteApplicationTests {

    @MockitoBean
    private DataSeeder dataSeeder;

    @MockitoBean
    private UserDocumentRepository userDocumentRepository;

    @Test
    void contextLoads() {
    }

}
