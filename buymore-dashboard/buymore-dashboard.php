<?php
/**
 * Plugin Name: BuyMore Commerce Dashboard
 * Description: A custom-coded, responsive commerce dashboard inspired by the BuyMore assignment reference.
 * Version: 1.0.0
 * Author: Anushka Sarkar
 * License: GPL-2.0-or-later
 * Text Domain: buymore-dashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

final class BuyMore_Dashboard {
    const POST_TYPE = 'bm_product';
    const VERSION   = '1.0.0';

    public function __construct() {
        add_action( 'init', array( $this, 'register_product_type' ) );
        add_action( 'init', array( $this, 'register_product_meta' ) );
        add_action( 'add_meta_boxes', array( $this, 'add_product_meta_box' ) );
        add_action( 'save_post_' . self::POST_TYPE, array( $this, 'save_product_meta' ) );
        add_action( 'wp_enqueue_scripts', array( $this, 'register_assets' ) );
        add_shortcode( 'buymore_dashboard', array( $this, 'shortcode' ) );
        add_action( 'rest_api_init', array( $this, 'register_rest_route' ) );
    }

    public function register_product_type() {
        register_post_type( self::POST_TYPE, array(
            'labels' => array(
                'name'          => __( 'BuyMore Products', 'buymore-dashboard' ),
                'singular_name' => __( 'BuyMore Product', 'buymore-dashboard' ),
                'add_new_item'  => __( 'Add BuyMore Product', 'buymore-dashboard' ),
                'edit_item'     => __( 'Edit BuyMore Product', 'buymore-dashboard' ),
            ),
            'public'       => false,
            'show_ui'      => true,
            'show_in_rest' => true,
            'menu_icon'    => 'dashicons-cart',
            'supports'     => array( 'title', 'editor', 'thumbnail' ),
        ) );
    }

    public function register_product_meta() {
        foreach ( array( 'price', 'category', 'label', 'image_url' ) as $key ) {
            register_post_meta( self::POST_TYPE, '_bm_' . $key, array(
                'type'              => 'string',
                'single'            => true,
                'show_in_rest'      => true,
                'sanitize_callback' => 'sanitize_text_field',
                'auth_callback'     => function () { return current_user_can( 'edit_posts' ); },
            ) );
        }
    }

    public function register_assets() {
        $base = plugin_dir_url( __FILE__ );
        wp_register_style( 'buymore-dashboard', $base . 'assets/style.css', array(), self::VERSION );
        wp_register_script( 'buymore-dashboard', $base . 'assets/app.js', array(), self::VERSION, true );
    }

    public function add_product_meta_box() {
        add_meta_box( 'bm-product-details', __( 'Product details', 'buymore-dashboard' ), array( $this, 'render_product_meta_box' ), self::POST_TYPE, 'normal', 'high' );
    }

    public function render_product_meta_box( $post ) {
        wp_nonce_field( 'bm_product_details', 'bm_product_nonce' );
        $fields = array(
            'price'     => __( 'Price (e.g. 36)', 'buymore-dashboard' ),
            'category'  => __( 'Category (men or women)', 'buymore-dashboard' ),
            'label'     => __( 'Card label (e.g. Our Picks)', 'buymore-dashboard' ),
            'image_url' => __( 'Image URL (optional)', 'buymore-dashboard' ),
        );
        echo '<p>' . esc_html__( 'These fields control how the product appears in the BuyMore dashboard.', 'buymore-dashboard' ) . '</p>';
        foreach ( $fields as $key => $label ) {
            printf( '<p><label for="bm-%1$s"><strong>%2$s</strong></label><br><input class="widefat" id="bm-%1$s" name="bm_%1$s" value="%3$s"></p>', esc_attr( $key ), esc_html( $label ), esc_attr( get_post_meta( $post->ID, '_bm_' . $key, true ) ) );
        }
    }

    public function save_product_meta( $post_id ) {
        if ( ! isset( $_POST['bm_product_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['bm_product_nonce'] ) ), 'bm_product_details' ) ) {
            return;
        }
        if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
        if ( ! current_user_can( 'edit_post', $post_id ) ) return;
        foreach ( array( 'price', 'category', 'label', 'image_url' ) as $key ) {
            if ( isset( $_POST['bm_' . $key] ) ) {
                update_post_meta( $post_id, '_bm_' . $key, sanitize_text_field( wp_unslash( $_POST['bm_' . $key] ) ) );
            }
        }
    }

    private function fallback_products() {
        return array(
            array( 'name' => 'WMX Rubber Zebra sandal', 'category' => 'women', 'price' => '36', 'label' => 'Our Picks', 'image' => 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=550&q=85' ),
            array( 'name' => 'Super Skinny jogger in brown', 'category' => 'men', 'price' => '89', 'label' => 'Your Choice', 'image' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=550&q=85' ),
        );
    }

    private function get_products() {
        $query = new WP_Query( array( 'post_type' => self::POST_TYPE, 'post_status' => 'publish', 'posts_per_page' => 12, 'no_found_rows' => true ) );
        $products = array();
        while ( $query->have_posts() ) {
            $query->the_post();
            $thumb = get_the_post_thumbnail_url( get_the_ID(), 'medium_large' );
            $products[] = array(
                'name'     => get_the_title(),
                'category' => get_post_meta( get_the_ID(), '_bm_category', true ) ?: 'women',
                'price'    => get_post_meta( get_the_ID(), '_bm_price', true ) ?: '36',
                'label'    => get_post_meta( get_the_ID(), '_bm_label', true ) ?: 'Our Picks',
                'image'    => $thumb ?: get_post_meta( get_the_ID(), '_bm_image_url', true ),
            );
        }
        wp_reset_postdata();
        return $products ?: $this->fallback_products();
    }

    public function register_rest_route() {
        register_rest_route( 'buymore/v1', '/products', array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => function () { return rest_ensure_response( $this->get_products() ); },
            'permission_callback' => '__return_true',
        ) );
    }

    public function shortcode() {
        wp_enqueue_style( 'buymore-dashboard' );
        wp_enqueue_script( 'buymore-dashboard' );
        $products = $this->get_products();
        ob_start();
        include __DIR__ . '/views/dashboard.php';
        return ob_get_clean();
    }
}

new BuyMore_Dashboard();

